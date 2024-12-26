<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()

onWalletConnected(gridStrategyStore.fetchAllStrategies)
</script>

<template>
  <div>
    <PartialsTradeFuturesOrdersTradingBotsHeader />
  </div>
</template>
