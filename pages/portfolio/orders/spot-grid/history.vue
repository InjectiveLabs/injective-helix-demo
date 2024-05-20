<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()

onWalletConnected(() => {
  gridStrategyStore.fetchAllStrategies()
})
</script>

<template>
  <div class="divide-y border-y">
    <PartialsTradeSpotOrdersTradingBotsHistoryTableHeader />
    <PartialsTradeSpotOrdersTradingBotsHistoryTableRow
      v-for="strategy in gridStrategyStore.removedStrategies"
      v-bind="{ strategy }"
      :key="strategy.createdAt"
    />
  </div>
</template>
