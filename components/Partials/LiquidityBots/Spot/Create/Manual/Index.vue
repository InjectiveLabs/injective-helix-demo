<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div>
    <PartialsLiquidityBotsSpotCreateManualGrids />
    <PartialsLiquidityBotsSpotCreateManualUpperLowerBounds
      v-bind="{ market: gridStrategyStore.spotMarket! }"
    />

    <PartialsLiquidityBotsSpotCreateManualRangeInput />

    <PartialsLiquidityBotsSpotCreateCommonInvestmentAmount
      v-bind="{ market: gridStrategyStore.spotMarket! }"
    />

    <PartialsLiquidityBotsSpotCreateCommonCreateStrategy />
  </div>
</template>
