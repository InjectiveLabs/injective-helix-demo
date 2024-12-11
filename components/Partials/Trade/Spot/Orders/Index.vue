<script setup lang="ts">
import {
  MarketKey,
  UiSpotMarket,
  TradingInterface,
  SpotOrdersStandardView
} from '@/types'

const spotStore = useSpotStore()
const accountStore = useAccountStore()
const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>
const tradingMode = useQueryRef('interface', TradingInterface.Standard)

const isTickerOnly = ref(false)
const view = ref(SpotOrdersStandardView.Orders)

function fetchSpotOrders() {
  if (!accountStore.subaccountId) {
    return
  }

  streamSpotOrders()

  Promise.all([
    spotStore.fetchSubaccountOrders(
      isTickerOnly.value ? [spotMarket.value.marketId] : undefined
    ),
    spotStore.fetchSubaccountOrderHistory({
      subaccountId: accountStore.subaccountId,
      filters: {
        marketIds: isTickerOnly.value ? [spotMarket.value.marketId] : undefined
      }
    }),
    spotStore.fetchSubaccountTrades({
      subaccountId: accountStore.subaccountId,
      filters: {
        marketIds: isTickerOnly.value ? [spotMarket.value.marketId] : undefined
      }
    })
  ])
}

function streamSpotOrders() {
  cancelStreams()

  spotStore.streamSubaccountOrders(spotMarket.value.marketId)
  spotStore.streamSubaccountOrderHistory(spotMarket.value.marketId)
  spotStore.streamSubaccountTrades(spotMarket.value.marketId)
}

function cancelStreams() {
  spotStore.cancelSubaccountStream()
  spotStore.cancelSubaccountOrdersHistoryStream()
  spotStore.cancelSubaccountTradesStream()
}

onUnmounted(() => {
  cancelStreams()
})

onSubaccountChange(() => {
  fetchSpotOrders()
})
</script>

<template>
  <div class="h-full">
    <PartialsTradeSpotOrdersStandardHeader
      v-model:is-ticker-only="isTickerOnly"
      v-model="view"
      @update:is-ticker-only="fetchSpotOrders"
    />

    <div class="overflow-x-auto w-full h-full">
      <div class="h-full">
        <PartialsTradeSpotOrdersStandard
          v-if="tradingMode === TradingInterface.Standard"
          v-bind="{ view, isTickerOnly }"
        />

        <PartialsTradeSpotOrdersTradingBots v-else />
      </div>
    </div>
  </div>
</template>
