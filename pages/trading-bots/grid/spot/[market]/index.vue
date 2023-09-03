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
    <div v-if="activeStrategies.length > 0" class="min-w-[1100px]">
      <PartialsGridStrategySpotStrategiesRunningHeader />
    </div>

    <div class="min-w-[1100px] overflow-y-auto noScrollbar">
      <PartialsGridStrategySpotStrategiesRunningRow
        v-for="strategy in activeStrategies"
        :key="`strategy-${strategy.createdAt}`"
        v-bind="{ strategy }"
      />
    </div>

    <CommonEmptyList
      v-if="activeStrategies.length === 0"
      :message="'No Strategies Found'"
    />
  </div>
</template>

<style scoped>
.noScrollbar::-webkit-scrollbar {
  display: none;
}
</style>
