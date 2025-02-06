<script setup lang="ts">
import { intervalOptions, LIGHT_CHART_MARKET_IDS } from '@/app/utils/constants'
import { BusEvents, ChartViewOption, UiMarketWithToken, SpotMarketCyTags } from '@/types'
import { MARKETS_POWERED_BY_STORK } from '@/app/data/marketInfo'

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {
    isSpot: false
  }
)

const interval = ref(4)
const view = ref(ChartViewOption.Chart)

const viewOptions = Object.values(ChartViewOption)

function onUpdateChart(chart: string) {
  useEventBus(BusEvents.UpdateMarketChart).emit(chart)
}

function setInterval(index: string) {
  interval.value = Number(index)
}

const isStorkPowered = computed(() =>
  MARKETS_POWERED_BY_STORK.includes(props.market.marketId)
)

const isLightChartMarket = computed(() =>
  LIGHT_CHART_MARKET_IDS.includes(props.market.marketId)
)
</script>

<template>
  <div class="flex max-lg:h-[500px] h-full flex-col">
    <div class="flex lg:flex-row justify-between">
      <div class="h-subHeader border-b w-full">
        <div
          class="flex h-subHeader w-full xl:w-[450px]"
          :data-cy="dataCyTag(SpotMarketCyTags.ChartHeader)"
        >
          <AppButtonSelect
            v-for="label in viewOptions"
            :key="label"
            v-model="view"
            :value="label"
            class="text-xs font-medium capitalize px-6 py-2 border-b-2 text-coolGray-400"
            :data-cy="`${dataCyTag(SpotMarketCyTags.ChartHeader)}-${label}`"
            active-classes="text-white border-blue-550"
            @update:modelValue="onUpdateChart"
          >
            {{ $t(`trade.${label}`) }}
          </AppButtonSelect>

          <div v-if="isStorkPowered" class="flex items-center">
            <a
              class="flex justify-center items-center text-coolGray-500 text-xs font-semibold px-4 space-x-2 hover:text-white py-2"
              href="https://www.stork.network/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>Powered By Stork</p>
              <img
                src="https://pbs.twimg.com/profile_images/1874876547363950592/gYOWy9ZJ_400x400.png"
                alt=""
                class="size-4 rounded"
              />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Light Trading Chart -->
    <div
      v-if="view === ChartViewOption.Chart && isLightChartMarket"
      class="border-b flex"
    >
      <AppButtonSelect
        v-for="(_, index) in intervalOptions"
        :key="index"
        v-bind="{
          value: index.toString(),
          modelValue: interval.toString()
        }"
        class="text-xs py-2 max-lg:flex-1 hover:bg-brand-800 text-coolGray-400 text-center w-8"
        active-classes="bg-brand-875 text-white"
        @update:model-value="setInterval"
      >
        {{ intervalOptions[Number(index)].label }}
      </AppButtonSelect>
    </div>

    <PartialsTradingLightTradingChartWrapper
      v-if="view === ChartViewOption.Chart && isLightChartMarket"
      v-bind="{
        market: market as UiMarketWithToken,
        marketId: market.marketId,
        isSpot,
        interval
      }"
    />

    <PartialsTradingMarketChart
      v-else-if="view === ChartViewOption.Chart"
      v-bind="{ market }"
    />

    <PartialsTradeChartDepth v-else-if="view === ChartViewOption.Depth" />
    <PartialsTradeChartInfo v-else />
  </div>
</template>
