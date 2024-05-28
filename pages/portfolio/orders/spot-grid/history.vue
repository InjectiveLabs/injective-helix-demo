<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()

const isMobile = useIsMobile()

onWalletConnected(() => {
  gridStrategyStore.fetchAllStrategies()
})
</script>

<template>
  <div class="divide-y border-y">
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
