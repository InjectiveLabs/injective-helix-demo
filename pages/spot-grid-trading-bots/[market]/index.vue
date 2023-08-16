<script setup lang="ts">
const gridStore = useGridStore()

const activeStrategies = computed(() =>
  gridStore.strategies.filter(
    (strategy) =>
      strategy.state === 'active' &&
      strategy.marketId === gridStore.market?.marketId
  )
)
</script>

<template>
  <div class="overflow-x-auto h-full grid grid-rows-[auto_1fr]">
    <div class="grid grid-cols-6 text-right p-4">
      <div class="font-normal text-xs text-left">Pair</div>

      <div class="font-normal text-xs">Upper Bound</div>

      <div class="font-normal text-xs">Lower Bound</div>

      <div class="font-normal text-xs">Created</div>

      <div class="font-normal text-xs">Base Quantity</div>

      <div class="font-normal text-xs">PnL</div>
    </div>

    <div class="bg-black rounded-xl overflow-hidden h-full">
      <PartialsGridTradingSpotStrategiesHistoryRow
        v-for="strategy in activeStrategies"
        v-bind="{ strategy }"
        :key="`strategy-removed-${strategy.createdAt}`"
      />
    </div>
  </div>
</template>
