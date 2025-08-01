<script lang="ts" setup>
import { BusEvents, SpotMarketCyTags, SpotOrdersStandardView } from '@/types'
import type { UiSpotMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
  }>(),
  {}
)

const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

const isTickerOnly = ref(false)
const view = ref(SpotOrdersStandardView.Orders)

const filteredOrders = computed(() =>
  spotStore.subaccountOrders.filter((order) => {
    if (isTickerOnly.value) {
      return order.marketId === props.market.marketId
    }

    return true
  })
)

function refreshData() {
  const marketId = isTickerOnly.value ? props.market.marketId : undefined
  const filters = marketId ? { filters: { marketIds: [marketId] } } : undefined

  spotStore.cancelSubaccountStream()

  Promise.all([
    spotStore.fetchSubaccountTrades(filters),
    spotStore.fetchSubaccountOrderHistory(filters),
    spotStore.fetchSubaccountOrders(marketId ? [marketId] : undefined)
  ]).catch($onError)

  spotStore.streamSubaccountOrders({
    marketId,
    onResetCallback: () =>
      spotStore.fetchSubaccountOrders(marketId ? [marketId] : undefined)
  })
  spotStore.streamSubaccountTrades({
    marketId,
    onResetCallback: () => {
      useEventBus(BusEvents.SubaccountTradeStreamResponded).emit()
      spotStore.fetchSubaccountTrades(filters)
    }
  })
  spotStore.streamSubaccountOrderHistory({
    marketId,
    onResetCallback: () => spotStore.fetchSubaccountOrderHistory(filters)
  })
}

onSubaccountChange(refreshData)

onUnmounted(() => {
  spotStore.cancelSubaccountStream()
  spotStore.resetSubaccount()
})
</script>

<template>
  <PartialsTradeSpotOrdersStandardHeader
    v-model="view"
    v-model:is-ticker-only="isTickerOnly"
    @update:is-ticker-only="refreshData"
  />

  <div
    class="w-full h-screenMinusHeader"
    :data-cy="dataCyTag(SpotMarketCyTags.OrderDetailsTable)"
  >
    <div class="overflow-x-auto divide-y h-full">
      <PartialsTradeCommonOrdersBalances
        v-if="view === SpotOrdersStandardView.Balances"
      />

      <PartialsPortfolioOrdersSpotOpenOrdersTable
        v-else-if="view === SpotOrdersStandardView.Orders"
        :orders="filteredOrders"
      />

      <PartialsPortfolioOrdersSpotOrderHistoryTable
        v-else-if="view === SpotOrdersStandardView.OrderHistory"
        :orders="spotStore.subaccountOrderHistory"
      />

      <PartialsPortfolioOrdersSpotTradeHistoryTable
        v-else-if="view === SpotOrdersStandardView.TradeHistory"
        :trades="spotStore.subaccountTrades"
      />
    </div>
  </div>
</template>
