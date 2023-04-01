<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['connected']
})

const appStore = useAppStore()
const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  Promise.all([
    spotStore.init(),
    derivativeStore.init(),
    exchangeStore.initFeeDiscounts(),
    accountStore.streamBankBalance(),
    accountStore.fetchAccountPortfolio(),
    accountStore.streamSubaccountBalance()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(appStore.pollMarkets, 1000 * 10)
</script>

<template>
  <AppHocLoading
    class="h-full"
    :status="status"
    :show-loading="!walletStore.isUserWalletConnected"
  >
    <div class="container">
      <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 relative">
        <PartialsAccount />
      </div>
    </div>
  </AppHocLoading>
</template>
