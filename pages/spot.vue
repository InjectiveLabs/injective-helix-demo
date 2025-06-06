<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { roundDustAmount } from '@/app/utils/formatters'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { MarketKey, IsSpotKey, UiSpotMarket, PortfolioStatusKey } from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const portfolioStatus = inject(
  PortfolioStatusKey,
  new Status(StatusType.Loading)
)

const market = computed(() =>
  spotStore.markets.find(
    (market) =>
      market.slug === route.params.slug ||
      market.marketId === route.query.marketId
  )
)

useSpotOrderbook(computed(() => market.value))

const { lastTradedPriceInUsd: spotLastTradedPriceInUsd } =
  useSpotLastPrice(market)

onMounted(async () => {
  if (route.query.marketId) {
    await spotStore.appendMarketId(route.query.marketId as string)
  }

  if (!market.value) {
    return navigateTo({ name: 'spot-slug', params: { slug: 'inj-usdt' } })
  }

  status.setLoading()

  Promise.all([
    spotStore.fetchTrades({
      marketId: market.value.marketId,
      executionSide: TradeExecutionSide.Taker
    })
  ])
    .catch($onError)
    .finally(() => status.setIdle())

  spotStore.reset()
  spotStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()

  await until(portfolioStatus).toMatch((status) => status.isIdle())

  spotStore.streamTrades({
    marketId: market.value.marketId,
    onResetCallback: () =>
      spotStore.fetchTrades({
        marketId: (market.value as UiSpotMarket).marketId
      })
  })

  derivativeStore.streamMarketsMarkPrices({
    marketIds: [...positionStore.positions.map(({ marketId }) => marketId)]
  })
})

useHead({
  title: computed(() => {
    const price = !spotLastTradedPriceInUsd.value.eq(0)
      ? `$${roundDustAmount({
          value: spotLastTradedPriceInUsd.value.toFixed(),
          decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
        })} |`
      : ''

    const ticker = market.value ? `${market.value.ticker} |` : ''

    return `${price} ${ticker} Helix`
  })
})

onUnmounted(() => {
  spotStore.reset()
  spotStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()
})

provide(IsSpotKey, true)
provide(MarketKey, market)
</script>

<template>
  <div v-if="market" v-bind="{ market }">
    <PartialsTradeLayout v-bind="{ market }" is-spot>
      <template #form>
        <PartialsTradeSpotForm />
      </template>

      <template #orders>
        <PartialsTradeSpotOrders v-bind="{ market }" />
      </template>
    </PartialsTradeLayout>

    <ModalsIAssets />
    <ModalsMarketNotOnHelix v-if="!market.isVerified" />
    <ModalsMarketRestricted v-bind="{ market, isSpot: true }" />
  </div>
</template>
