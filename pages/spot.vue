<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { MarketKey, IsSpotKey, PortfolioStatusKey } from '@/types'

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

onMounted(async () => {
  if (route.query.marketId) {
    await spotStore.appendMarketId(route.query.marketId as string)
  }

  if (!market.value) {
    return navigateTo({ name: 'spot-slug', params: { slug: 'inj-usdt' } })
  }

  status.setLoading()

  Promise.all([
    positionStore.fetchPositions(),
    // spot page data
    // derivativeStore.fetchOpenInterest(),
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

  spotStore.streamTrades(market.value.marketId)
  derivativeStore.streamMarketsMarkPrices([
    ...positionStore.positions.map(({ marketId }) => marketId)
  ])
})

onSubaccountChange(() =>
  Promise.all([positionStore.fetchPositions()]).catch($onError)
)

onUnmounted(() => {
  spotStore.reset()
  spotStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()
})

provide(IsSpotKey, true)
provide(MarketKey, market)
</script>

<template>
  <div v-if="market">
    <PartialsTradeLayout v-bind="{ market }" is-spot>
      <template #form>
        <PartialsTradeSpotForm />
      </template>

      <template #orders>
        <PartialsTradeSpotOrders />
      </template>
    </PartialsTradeLayout>

    <ModalsMarketNotOnHelix v-if="!market.isVerified" />
    <ModalsMarketRestricted v-bind="{ market, isSpot: true }" />
  </div>
</template>
