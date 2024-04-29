<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div class="divide-y border-b">
    <PartialsTradeSpotOrdersTradingBotsHistoryTableHeader />
    <PartialsTradeSpotOrdersTradingBotsHistoryTableRow
      v-for="strategy in gridStrategyStore.removedStrategies"
      v-bind="{ strategy }"
      :key="strategy.createdAt"
    />
  </div>
</template>
