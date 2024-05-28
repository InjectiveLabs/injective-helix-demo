<script setup lang="ts">
const isMobile = useIsMobile()
const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div class="divide-y border-b">
    <PartialsTradeSpotOrdersTradingBotsHistoryTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsTradeSpotOrdersTradingBotsHistoryTableMobileRow
        v-for="strategy in gridStrategyStore.removedStrategies"
        v-bind="{ strategy }"
        :key="strategy.createdAt"
      />
    </div>

    <template v-else>
      <PartialsTradeSpotOrdersTradingBotsHistoryTableRow
        v-for="strategy in gridStrategyStore.removedStrategies"
        v-bind="{ strategy }"
        :key="strategy.createdAt"
      />
    </template>
  </div>
</template>
