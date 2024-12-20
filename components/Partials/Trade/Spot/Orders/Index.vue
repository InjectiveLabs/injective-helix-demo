<script lang="ts" setup>
import { UiSpotMarket, TradingInterface, SpotOrdersStandardView } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
  }>(),
  {}
)

const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

const tradingMode = useQueryRef('interface', TradingInterface.Standard)

const isTickerOnly = ref(false)
const view = ref(SpotOrdersStandardView.Orders)

onSubaccountChange(refreshData)
onUnmounted(() => spotStore.cancelSubaccountStream())

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
</script>

<template>
  <div class="overflow-x-auto divide-y h-full">
    <PartialsTradeSpotOrdersStandardHeader
      v-model="view"
      v-model:is-ticker-only="isTickerOnly"
      @update:is-ticker-only="refreshData"
    />

    <div class="w-full h-screenMinusHeader">
      <div
        v-if="tradingMode === TradingInterface.Standard"
        class="overflow-x-auto divide-y h-full"
      >
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
      </div>

      <PartialsTradeSpotOrdersTradingBots v-else />
    </div>
  </div>
</template>
