<script setup lang="ts">
import { BusEvents, MarketKey, PerpOrdersStandardView } from '@/types'
import type { UiDerivativeMarket } from '@/types'

const activityStore = useActivityStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const isTickerOnly = ref(false)
const view = ref(PerpOrdersStandardView.Positions)

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
  ]).catch($onError)

  derivativeStore.streamSubaccountOrders({
    marketId,
    onResetCallback: () =>
      derivativeStore.fetchSubaccountOrders(marketId ? [marketId] : undefined)
  })
  derivativeStore.streamSubaccountTrades({
    marketId,
    onResetCallback: () => {
      useEventBus(BusEvents.SubaccountTradeStreamResponded).emit()
      derivativeStore.fetchSubaccountTrades(filters)
    }
  })
  derivativeStore.streamSubaccountOrderHistory({
    marketId,
    onResetCallback: () => derivativeStore.fetchSubaccountOrderHistory(filters)
  })
}
</script>

<template>
  <div class="h-full">
    <PartialsTradeFuturesOrdersStandardHeader
      v-model="view"
      v-model:is-ticker-only="isTickerOnly"
      @update:is-ticker-only="refreshData"
    />

    <div class="w-full h-screenMinusHeader">
      <PartialsTradeCommonOrdersBalances
        v-if="view === PerpOrdersStandardView.Balances"
      />

      <PartialsTradeFuturesOrdersStandardPositions
        v-else-if="view === PerpOrdersStandardView.Positions"
        v-bind="{ isTickerOnly }"
      />

      <PartialsTradeFuturesOrdersStandardOpenOrders
        v-else-if="view === PerpOrdersStandardView.Orders"
        v-bind="{ isTickerOnly }"
      />

      <PartialsTradeFuturesOrdersStandardAdvancedOrders
        v-else-if="view === PerpOrdersStandardView.AdvancedOrders"
      />

      <PartialsTradeFuturesOrdersStandardOrderHistory
        v-else-if="view === PerpOrdersStandardView.OrderHistory"
      />

      <PartialsTradeFuturesOrdersStandardTradeHistory
        v-else-if="view === PerpOrdersStandardView.TradeHistory"
      />

      <PartialsTradeFuturesOrdersStandardFundingHistory
        v-else-if="view === PerpOrdersStandardView.FundingHistory"
      />
    </div>
  </div>
</template>
