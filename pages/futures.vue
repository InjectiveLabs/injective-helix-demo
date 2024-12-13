<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  IsSpotKey,
  MarketKey,
  PortfolioStatusKey,
  UiDerivativeMarket
} from '@/types'

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
  if (route.query.marketId) {
    await derivativeStore.appendMarketId(route.query.marketId as string)
  }

  if (!market.value) {
    return navigateTo({
      name: 'futures-slug',
      params: { slug: 'btc-usdt-perp' }
    })
  }

  status.setLoading()

  Promise.all([
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

  derivativeStore.streamSubaccountOrders({ marketId: market.value.marketId })
  derivativeStore.streamSubaccountOrderHistory({
    marketId: market.value.marketId
  })
  derivativeStore.streamSubaccountTrades({ marketId: market.value.marketId })

  derivativeStore.streamTrades({
    marketId: market.value.marketId,
    onResetCallback: () =>
      derivativeStore.fetchTrades({
        marketId: (market.value as UiDerivativeMarket).marketId
      })
  })
  derivativeStore.streamMarketsMarkPrices({
    marketIds: [
      market.value.marketId,
      ...positionStore.positions.map(({ marketId }) => marketId)
    ]
  })
})

onUnmounted(() => {
  derivativeStore.reset()
  derivativeStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()
})

provide(MarketKey, market)
provide(IsSpotKey, false)
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
