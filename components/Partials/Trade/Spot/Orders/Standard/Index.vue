<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOrdersStandardView } from '@/types'

const spotStore = useSpotStore()
const accountStore = useAccountStore()

const view = ref(SpotOrdersStandardView.OpenOrders)
const status = reactive(new Status(StatusType.Loading))

function fetchSpotOrders() {
  if (!accountStore.subaccountId) {
    return
  }

  status.setLoading()

  streamSpotOrders()

  Promise.all([
    spotStore.fetchSubaccountOrders(),
    spotStore.fetchSubaccountOrderHistory({
      subaccountId: accountStore.subaccountId
    }),
    spotStore.fetchSubaccountTrades({
      subaccountId: accountStore.subaccountId
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
    <PartialsTradeSpotOrdersStandardHeader v-model="view" />

    <div class="overflow-x-auto border-b">
      <PartialsTradeCommonOrdersBalances
        v-if="view === SpotOrdersStandardView.Balances"
      />

      <PartialsTradeSpotOrdersStandardOpenOrders
        v-else-if="view === SpotOrdersStandardView.OpenOrders"
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
