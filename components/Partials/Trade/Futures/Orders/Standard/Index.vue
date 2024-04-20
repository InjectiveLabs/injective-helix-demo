<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PerpOrdersStandardView } from '@/types'

const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()

const view = ref(PerpOrdersStandardView.OpenPositions)
const status = reactive(new Status(StatusType.Loading))

function fetchDerivativeOrders() {
  if (!accountStore.subaccountId) {
    return
  }

  status.setLoading()

  Promise.all([
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.fetchSubaccountOrderHistory({
      subaccountId: accountStore.subaccountId
    }),
    derivativeStore.fetchSubaccountTrades({
      subaccountId: accountStore.subaccountId
    }),
    positionStore.fetchSubaccountPositions({
      subaccountId: accountStore.subaccountId
    })
  ])
}

watch(() => accountStore.subaccountId, fetchDerivativeOrders, {
  immediate: true
})
</script>

<template>
  <div>
    <PartialsTradeFuturesOrdersStandardHeader v-model="view" />

    <div class="overflow-x-auto border-b max-h-md">
      <PartialsTradeCommonOrdersBalances
        v-if="view === PerpOrdersStandardView.Balances"
      />

      <PartialsTradeFuturesOrdersStandardPositions
        v-else-if="view === PerpOrdersStandardView.OpenPositions"
      />

      <PartialsTradeFuturesOrdersStandardOpenOrders
        v-else-if="view === PerpOrdersStandardView.OpenOrders"
      />

      <PartialsTradeFuturesOrdersStandardTriggers
        v-else-if="view === PerpOrdersStandardView.Triggers"
      />

      <PartialsTradeFuturesOrdersStandardOrderHistory
        v-else-if="view === PerpOrdersStandardView.OrderHistory"
      />

      <PartialsTradeFuturesOrdersStandardTradeHistory
        v-else-if="view === PerpOrdersStandardView.TradeHistory"
      />
    </div>
  </div>
</template>
