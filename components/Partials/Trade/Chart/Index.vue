<script setup lang="ts">
import { ChartViewOption, UiMarketWithToken } from '@/types'
import { intervalOptions } from '@/app/utils/constants'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const view = ref(ChartViewOption.Chart)
const interval = ref(4)

const viewOptions = Object.values(ChartViewOption)

function setInterval(index: string) {
  interval.value = Number(index)
}
</script>

<template>
  <div class="flex max-lg:h-[500px] h-full flex-col">
    <div class="flex lg:flex-row justify-between">
      <div class="flex h-header flex-1 shrink-0 border-b">
        <AppButtonSelect
          v-for="label in viewOptions"
          :key="label"
          v-model="view"
          :value="label"
          class="font-bold text-sm flex justify-center items-center px-6 border-r text-gray-600 max-lg:flex-1"
          active-classes="bg-brand-875 text-white"
        >
          {{ $t(`trade.${label}`) }}
        </AppButtonSelect>
      </div>
    </div>

    <div v-if="view === ChartViewOption.Chart" class="border-b flex">
      <AppButtonSelect
        v-for="(_, index) in intervalOptions"
        :key="index"
        v-bind="{
          value: index.toString(),
          modelValue: interval.toString()
        }"
        class="text-xs py-2 max-lg:flex-1 hover:bg-brand-800 text-gray-500 text-center w-10"
        active-classes="bg-brand-875 text-white"
        @update:model-value="setInterval"
      >
        {{ intervalOptions[Number(index)].label }}
      </AppButtonSelect>
    </div>

    <PartialsTradingLightTradingChartWrapper
      v-if="view === ChartViewOption.Chart"
      v-bind="{
        market: market as UiMarketWithToken,
        marketId: market.marketId,
        isSpot: true,
        interval
      }"
    />

    <PartialsTradingMarketChart
      v-if="view === ChartViewOption.ProChart"
      v-bind="{ market }"
    />

    <PartialsTradeChartDepth v-else-if="view === ChartViewOption.Depth" />
    <PartialsTradeChartInfo v-else />
  </div>
</template>
