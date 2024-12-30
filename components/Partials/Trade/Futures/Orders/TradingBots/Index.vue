<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PerpOrdersTradingBotsView } from '@/types'

const gridStrategyStore = useGridStrategyStore()

const view = ref(PerpOrdersTradingBotsView.ActiveStrategies)
const status = reactive(new Status(StatusType.Loading))
const { $onError } = useNuxtApp()

onWalletConnected(fetchStrategies)

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
    <PartialsTradeFuturesOrdersTradingBotsHeader v-model="view" />

    <PartialsTradeFuturesOrdersTradingBotsRunning
      v-if="view === PerpOrdersTradingBotsView.ActiveStrategies"
    />

    <PartialsTradeFuturesOrdersTradingBotsHistory
      v-else-if="view === PerpOrdersTradingBotsView.RemovedStrategies"
    />
  </div>
</template>
