<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MarketKey, UiSpotMarket, SpotOrdersStandardView } from '@/types'

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()
const accountStore = useAccountStore()

const view = ref(SpotOrdersStandardView.OpenOrders)
const status = reactive(new Status(StatusType.Loading))
const isTickerOnly = ref(false)

function fetchSpotOrders() {
  if (!accountStore.subaccountId) {
    return
  }

  status.setLoading()

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

  spotStore.streamSubaccountOrders()
  spotStore.streamSubaccountOrderHistory()
  spotStore.streamSubaccountTrades()
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
  <div>
    <PartialsTradeSpotOrdersStandardHeader
      v-model:is-ticker-only="isTickerOnly"
      v-model="view"
      @update:is-ticker-only="fetchSpotOrders"
    />

    <div class="overflow-x-auto border-b">
      <PartialsTradeCommonOrdersBalances
        v-if="view === SpotOrdersStandardView.Balances"
      />

      <PartialsTradeSpotOrdersStandardOpenOrders
        v-else-if="view === SpotOrdersStandardView.OpenOrders"
        v-bind="{ isTickerOnly }"
      />

      <PartialsTradeSpotOrdersStandardOrderHistory
        v-else-if="view === SpotOrdersStandardView.OrderHistory"
      />

      <PartialsTradeSpotOrdersStandardTradeHistory
        v-else-if="view === SpotOrdersStandardView.TradeHistory"
      />
    </div>
  </div>
</template>
