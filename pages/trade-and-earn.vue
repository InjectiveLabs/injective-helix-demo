<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  status.setLoading()

  exchangeStore
    .initTradeAndEarn()
    .then(() => {
      Promise.all([
        tokenStore.fetchInjUsdPrice(),
        exchangeStore.fetchParams(),
        exchangeStore.fetchTradingRewardsCampaign()
      ])
        .catch($onError)
        .finally(() => {
          status.setIdle()
        })
    })
    .catch($onError)
})

onBeforeUnmount(() => {
  exchangeStore.reset()
})
</script>

<template>
  <AppHocLoading :status="status" class="h-full">
    <div class="container">
      <div class="w-full mx-auto xl:w-4/5 relative">
        <PartialsTradeAndEarnCurrentEpoch class="mt-6" />
        <PartialsTradeAndEarnPendingRewards class="mt-12" />
        <PartialsTradeAndEarnMarketsInfo class="mt-12" />
      </div>
    </div>
  </AppHocLoading>
</template>
