<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()

const removedStrategies = computed(() =>
  gridStrategyStore.strategies.filter(
    (strategy) =>
      strategy.state === 'removed' &&
      strategy.marketId === gridStrategyStore.spotMarket?.marketId
  )
)
</script>

<template>
  <div>
    <div class="min-w-[1100px]">
      <PartialsGridStrategySpotStrategiesHistoryHeader />
    </div>

    <div class="min-w-[1100px] overflow-y-auto noScrollbar">
      <PartialsGridStrategySpotStrategiesHistoryRow
        v-for="strategy in removedStrategies"
        :key="`strategy-${strategy.createdAt}`"
        v-bind="{ strategy }"
      />
    </div>
  </div>
</template>

<style scoped>
.noScrollbar::-webkit-scrollbar {
  display: none;
}
</style>
