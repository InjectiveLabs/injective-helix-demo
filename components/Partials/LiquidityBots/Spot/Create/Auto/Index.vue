<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div>
    <PartialsLiquidityBotsSpotCreateAutoParameters class="mb-4" />
    <PartialsLiquidityBotsSpotCreateCommonInvestmentAmount
      v-bind="{ market: gridStrategyStore.spotMarket! }"
      class="mb-4"
      is-auto
    />
    <PartialsLiquidityBotsSpotCreateCommonCreateStrategy />
  </div>
</template>
