<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="border-b shrink-0 h-header">
      <button v-for="label in ['Chart', 'Depth', 'Info']" :key="label">
        {{ label }}
      </button>
    </div>

    <PartialsTradingLightTradingChartWrapper
      v-bind="{
        market: market as UiMarketWithToken,
        marketId: market.marketId,
        isSpot: true
      }"
    />
  </div>
</template>
