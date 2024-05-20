<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()

onWalletConnected(() => {
  gridStrategyStore.fetchAllStrategies()
})
</script>

<template>
  <div class="divide-y border-y">
    <PartialsTradeSpotOrdersTradingBotsRunningTableHeader />
    <PartialsTradeSpotOrdersTradingBotsRunningTableRow
      v-for="strategy in gridStrategyStore.activeStrategies"
      v-bind="{ strategy }"
      :key="strategy.createdAt"
    />
  </div>
</template>
