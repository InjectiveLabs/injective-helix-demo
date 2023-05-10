<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const route = useRoute()
const bridgeStore = useBridgeStore()

const status = reactive(new Status(StatusType.Loading))

function fetchData() {
  status.setLoading()

  Promise.all([
    bridgeStore.fetchPeggyWithdrawalTransactions(),
    bridgeStore.fetchIBCTransferTransactions(),
    bridgeStore.fetchInjectiveTransactions()
  ]).finally(() => {
    status.setIdle()
  })
}

watch(() => route.fullPath, fetchData, { immediate: true })
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <PartialsActivityViewsWalletHistoryWithdrawals />
  </AppHocLoading>
</template>
