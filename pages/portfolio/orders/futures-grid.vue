<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
const { t } = useLang()

const gridStrategyStore = useGridStrategyStore()

const status = reactive(new Status(StatusType.Loading))
const { $onError } = useNuxtApp()

const options = [
  {
    label: t('sgt.tabs.liveFuturesGrid'),
    to: '/portfolio/orders/futures-grid'
  },
  {
    label: t('sgt.tabs.futuresGridHistory'),
    to: '/portfolio/orders/futures-grid/history'
  }
]

onWalletConnected(() => {
  status.setLoading()

  gridStrategyStore
    .fetchAllStrategies()
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('tradingBots.futuresGrid') }}</h3>
    </div>

    <div class="flex">
      <NuxtLink
        v-for="option in options"
        :key="option.label"
        :to="option.to"
        class="p-4 text-coolGray-400 font-medium"
        exact-active-class="text-white"
      >
        {{ option.label }}
      </NuxtLink>
    </div>

    <div>
      <div v-if="status.isLoading()" class="p-4">
        <USkeleton class="w-full h-52" />
      </div>

      <NuxtPage v-else />
    </div>
  </div>
</template>
