<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['connected']
})

const appStore = useAppStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  Promise.all([
    accountStore.fetchAccountPortfolioBalances(),
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance()
  ])
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(appStore.pollMarkets, 1000 * 10)
</script>

<template>
  <AppHocLoading
    class="h-full"
    :status="status"
    :is-loading="!walletStore.isUserWalletConnected"
  >
    <div class="container">
      <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 relative">
        <PartialsAccount />
      </div>
    </div>
  </AppHocLoading>
</template>
