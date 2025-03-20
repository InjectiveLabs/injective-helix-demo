<script setup lang="ts">
import {
  BusEvents,
  MarketKey,
  TradingInterface,
  UiDerivativeMarket
} from '@/types'
import { PartialsTradeFuturesOrdersStandard } from '#components'

const activityStore = useActivityStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const tradingMode = useQueryRef('interface', TradingInterface.Standard)

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const isTickerOnly = ref(false)

onSubaccountChange(refreshData)
onUnmounted(() => derivativeStore.cancelSubaccountStream())

function refreshData() {
  const marketId = isTickerOnly.value ? market.value.marketId : undefined
  const filters = marketId ? { filters: { marketIds: [marketId] } } : undefined

  derivativeStore.cancelSubaccountStream()

  Promise.all([
    derivativeStore.fetchSubaccountTrades(filters),
    derivativeStore.fetchSubaccountConditionalOrders(
      marketId ? [marketId] : undefined
    ),
    activityStore.fetchSubaccountFundingHistory(filters),
    derivativeStore.fetchSubaccountOrderHistory(filters),
    derivativeStore.fetchSubaccountOrders(marketId ? [marketId] : undefined)
  ])
    .then(() => useEventBus(BusEvents.LimitOrdersModifyOnChart).emit())
    .catch($onError)

  derivativeStore.streamSubaccountOrders({
    marketId,
    onResetCallback: () =>
      derivativeStore.fetchSubaccountOrders(marketId ? [marketId] : undefined)
  })
  derivativeStore.streamSubaccountTrades({
    marketId,
    onResetCallback: () => derivativeStore.fetchSubaccountTrades(filters)
  })
  derivativeStore.streamSubaccountOrderHistory({
    marketId,
    onResetCallback: () => derivativeStore.fetchSubaccountOrderHistory(filters)
  })
}
</script>

<template>
  <div class="h-full">
    <PartialsTradeFuturesOrdersStandard
      v-if="tradingMode === TradingInterface.Standard"
    />

    <PartialsTradeFuturesOrdersTradingBots
      v-else-if="tradingMode === TradingInterface.TradingBots"
      v-bind="{ market }"
    />
  </div>
</template>
