<script setup lang="ts">
import { ChartViewOption, UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const view = ref(ChartViewOption.Chart)

const viewOptions = Object.values(ChartViewOption)
</script>

<template>
  <div class="flex max-lg:h-[500px] h-full flex-col">
    <div class="border-b shrink-0 h-header flex">
      <AppButtonSelect
        v-for="label in viewOptions"
        :key="label"
        v-model="view"
        :value="label"
        class="font-bold text-sm flex justify-center items-center px-6 border-r text-gray-600 max-lg:flex-1"
        active-classes="bg-brand-800 text-white"
      >
        {{ $t(`trade.${label}`) }}
      </AppButtonSelect>
    </div>

    <PartialsTradingLightTradingChartWrapper
      v-if="view === ChartViewOption.Chart"
      v-bind="{
        market: market as UiMarketWithToken,
        marketId: market.marketId,
        isSpot: true
      }"
    />

    <PartialsTradeChartDepth v-else-if="view === ChartViewOption.Depth" />
    <PartialsTradeChartInfo v-else />
  </div>
</template>
