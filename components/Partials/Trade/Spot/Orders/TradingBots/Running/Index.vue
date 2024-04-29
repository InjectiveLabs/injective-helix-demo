<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div class="divide-y border-b">
    <PartialsTradeSpotOrdersTradingBotsRunningTableHeader />
    <PartialsTradeSpotOrdersTradingBotsRunningTableRow
      v-for="strategy in gridStrategyStore.activeStrategies"
      v-bind="{ strategy }"
      :key="strategy.createdAt"
    />
  </div>
</template>
