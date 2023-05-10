<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const route = useRoute()
const bridgeStore = useBridgeStore()

const status = reactive(new Status(StatusType.Loading))

function fetchData() {
  status.setLoading()

  Promise.all([
    bridgeStore.fetchPeggyDepositTransactions(),
    bridgeStore.fetchIBCTransferTransactions(),
    bridgeStore.fetchInjectiveTransactions()
  ]).finally(() => {
    status.setIdle()
  })
}

watch(() => route.query, fetchData, { immediate: true })
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <div>
      <PartialsActivityViewsWalletHistoryDeposits />
    </div>
  </AppHocLoading>
</template>
