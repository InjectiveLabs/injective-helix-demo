<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { GridStrategyTabs } from '@/types'

const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const view = ref(GridStrategyTabs.Running)
const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  fetchStrategies()
})

function fetchStrategies() {
  status.setLoading()

  gridStrategyStore
    .fetchAllStrategies()
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div>
    <PartialsTradeSpotOrdersTradingBotsTabs
      v-model="view"
      @update:model-value="fetchStrategies"
    />

    <PartialsTradeSpotOrdersTradingBotsRunning
      v-if="view === GridStrategyTabs.Running"
    />
    <PartialsTradeSpotOrdersTradingBotsHistory v-else />
  </div>
</template>
