<script lang="ts" setup>
import { UiSpotMarket, SpotOrdersStandardView } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
  }>(),
  {}
)

const spotStore = useSpotStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const isTickerOnly = ref(false)
const view = ref(SpotOrdersStandardView.Orders)

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
    onResetCallback: () => spotStore.fetchSubaccountTrades(filters)
  })
  spotStore.streamSubaccountOrderHistory({
    marketId,
    onResetCallback: () => spotStore.fetchSubaccountOrderHistory(filters)
  })
}

onWalletConnected(() => {
  fetchStrategies()
})

function fetchStrategies() {
  gridStrategyStore.fetchAllStrategies().catch($onError)
}

onSubaccountChange(refreshData)

onUnmounted(() => spotStore.cancelSubaccountStream())
</script>

<template>
  <div class="overflow-x-auto divide-y h-full">
    <PartialsTradeSpotOrdersStandardHeader
      v-model="view"
      v-model:is-ticker-only="isTickerOnly"
      @update:is-ticker-only="refreshData"
    />

    <div class="w-full h-screenMinusHeader">
      <div class="overflow-x-auto divide-y h-full">
        <PartialsTradeCommonOrdersBalances
          v-if="view === SpotOrdersStandardView.Balances"
        />

        <PartialsTradeSpotOrdersStandardOpenOrders
          v-else-if="view === SpotOrdersStandardView.Orders"
          v-bind="{ isTickerOnly }"
        />

        <PartialsTradeSpotOrdersStandardOrderHistory
          v-else-if="view === SpotOrdersStandardView.OrderHistory"
        />

        <PartialsTradeSpotOrdersStandardTradeHistory
          v-else-if="view === SpotOrdersStandardView.TradeHistory"
        />

        <PartialsTradeSpotOrdersTradingBotsRunning
          v-else-if="view === SpotOrdersStandardView.ActiveStrategies"
        />

        <PartialsTradeSpotOrdersTradingBotsHistory
          v-else-if="view === SpotOrdersStandardView.RemovedStrategies"
        />
      </div>
    </div>
  </div>
</template>
