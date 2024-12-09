<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { IsSpotKey, MarketKey, PortfolioStatusKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const portfolioStatus = inject(
  PortfolioStatusKey,
  new Status(StatusType.Loading)
)

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  derivativeStore.markets.find(
    (market) =>
      market.slug === route.params.slug ||
      market.marketId === route.query.marketId
  )
)

useDerivativeOrderbook(computed(() => market.value))

onWalletConnected(async () => {
  if (!market.value) {
    return navigateTo({
      name: 'futures-slug',
      params: { slug: 'btc-usdt-perp' }
    })
  }

  status.setLoading()

  Promise.all([
    // futures data
    derivativeStore.fetchOpenInterest(),
    derivativeStore.fetchTrades({
      marketId: market.value.marketId,
      executionSide: TradeExecutionSide.Taker
    }),
    derivativeStore.getMarketMarkPrice(market.value)
  ])
    .catch($onError)
    .finally(() => status.setIdle())

  derivativeStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()

  await until(portfolioStatus).toMatch((status) => status.isIdle())

  derivativeStore.streamTrades(market.value.marketId)
  derivativeStore.streamMarketsMarkPrices([
    market.value.marketId,
    ...positionStore.positions.map(({ marketId }) => marketId)
  ])
})

onUnmounted(() => {
  derivativeStore.reset()
  derivativeStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()
})

provide(MarketKey, market)
provide(IsSpotKey, false)

useIntervalFn(
  () =>
    Promise.all([
      derivativeStore.fetchOpenInterest(),
      derivativeStore.fetchMarketsSummary()
    ]),
  60 * 1000
)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }">
    <template #form>
      <PartialsTradeFuturesForm />
    </template>

    <template #orders>
      <PartialsTradeFuturesOrders />
    </template>
  </PartialsTradeLayout>

  <ModalsMarketRestricted v-if="market" v-bind="{ market }" />
</template>
