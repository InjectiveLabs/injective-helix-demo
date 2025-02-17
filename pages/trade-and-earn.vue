<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  status.setLoading()

  exchangeStore
    .initTradeAndEarn()
    .then(() => {
      Promise.all([
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
</script>

<template>
  <div>
    <AppHocLoading :status="status" is-full-screen>
      <div class="container mx-auto pt-10">
        <div class="w-full mx-auto xl:w-4/5 relative">
          <div class="space-y-2">
            <h1 class="text-3xl font-bold">{{ $t('tradeAndEarn.title') }}</h1>
            <div class="flex items-center space-x-2">
              <p>{{ $t('tradeAndEarn.description') }}</p>
            </div>
          </div>

          <PartialsTradeAndEarnCurrentEpoch class="mt-8" />
          <PartialsTradeAndEarnPendingRewards class="mt-12" />
          <PartialsTradeAndEarnMarketsInfo class="mt-12" />
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
