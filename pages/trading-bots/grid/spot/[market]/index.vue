<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()

const activeStrategies = computed(() =>
  gridStrategyStore.strategies.filter(
    (strategy) =>
      strategy.state === 'active' &&
      strategy.marketId === gridStrategyStore.spotMarket?.marketId
  )
)
</script>

<template>
  <div>
    <div class="min-w-[1100px]">
      <PartialsGridStrategySpotStrategiesRunningHeader />
    </div>

    <div class="min-w-[1100px] overflow-y-auto noScrollbar">
      <PartialsGridStrategySpotStrategiesRunningRow
        v-for="strategy in activeStrategies"
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
