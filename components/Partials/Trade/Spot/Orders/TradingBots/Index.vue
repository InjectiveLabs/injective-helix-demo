<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { GridStrategyTabs, spotMarketKey } from '@/types'

const market = inject(spotMarketKey)

const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const view = ref(GridStrategyTabs.Running)
const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  if (!market?.value) {
    return
  }

  status.setLoading()

  gridStrategyStore
    .fetchStrategies(market.value.marketId)
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div>
    <PartialsTradeSpotOrdersTradingBotsTabs v-model="view" />

    <PartialsTradeSpotOrdersTradingBotsRunning
      v-if="view === GridStrategyTabs.Running"
    />
    <PartialsTradeSpotOrdersTradingBotsHistory v-else />
  </div>
</template>
