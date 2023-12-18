<script lang="ts" setup>
import { breakpointsTailwind } from '@vueuse/core'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  customAggregations,
  getDecimalPlaceFromValue
} from '@/app/data/aggregation'
import { UI_DEFAULT_AGGREGATION_DECIMALS_STRING } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'
import { getMinPriceTickSize } from '@/app/utils/helpers'

const FilterList = {
  Orderbook: 'Orderbook',
  Trades: 'Trades',
  Charts: 'MarketChart'
}

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { lg: isDesktop } = useBreakpoints(breakpointsTailwind)

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot

const activeType = ref(FilterList.Orderbook)
const maxTick = ref<string | undefined>(undefined)
const status = reactive(new Status(StatusType.Loading))
const minTick = ref(UI_DEFAULT_AGGREGATION_DECIMALS_STRING)
const aggregation = ref(UI_DEFAULT_AGGREGATION_DECIMALS_STRING)

onMounted(() => {
  const { marketId } = props.market

  // reset state
  spotStore.trades = []
  spotStore.orderbook = undefined
  derivativeStore.trades = []
  derivativeStore.orderbook = undefined

  Promise.all(
    isSpot
      ? [
          spotStore.fetchOrderbook(marketId),
          spotStore.fetchTrades({
            marketId,
            executionSide: TradeExecutionSide.Taker
          })
        ]
      : [
          derivativeStore.fetchOrderbook(marketId),
          derivativeStore.fetchTrades({
            marketId,
            executionSide: TradeExecutionSide.Taker
          })
        ]
  )
    .catch($onError)
    .finally(() => {
      status.setIdle()
      onInit()
    })
})

function onInit() {
  if (props.market && props.market.minQuantityTickSize) {
    const formattedPriceTickSize = getMinPriceTickSize(isSpot, props.market)

    const minTickSize =
      getDecimalPlaceFromValue(formattedPriceTickSize) ||
      UI_DEFAULT_AGGREGATION_DECIMALS_STRING

    minTick.value = minTickSize
    aggregation.value = minTickSize

    const customAggregation = customAggregations[props.market.ticker]

    if (!customAggregation) {
      return
    }

    // applies custom aggregation base on pre configured settings
    if (customAggregation.minTick) {
      minTick.value = customAggregation.minTick
    }

    maxTick.value = customAggregation.maxTick || undefined
    aggregation.value = customAggregation.default || minTickSize
  }
}

watchDebounced(
  isDesktop,
  (isDesktop) => {
    activeType.value = !isDesktop ? FilterList.Charts : FilterList.Orderbook
  },
  { debounce: 100, immediate: true }
)
</script>

<template>
  <div class="lg:p-3">
    <div class="flex items-center justify-between flex-wrap">
      <div class="flex items-center gap-4 px-4 py-3 lg:pt-0 lg:px-0">
        <AppSelectButton
          v-for="displayType in Object.values(FilterList)"
          :key="`display-type-${displayType}`"
          v-model="activeType"
          :value="displayType"
        >
          <template #default="{ isActive }">
            <span
              class="text-xs leading-4 tracking-widest cursor-pointer uppercase"
              :class="[
                isActive
                  ? 'text-gray-200 hover:text-gray-100 uppercase'
                  : 'text-gray-500 hover:text-gray-200'
              ]"
            >
              <span v-if="displayType === FilterList.Orderbook">
                {{ $t('trade.orderbook') }}
              </span>

              <span v-if="displayType === FilterList.Trades">
                {{ $t('trade.trades') }}
              </span>

              <span v-if="displayType === FilterList.Charts" class="lg:hidden">
                {{ $t('trade.chart') }}
              </span>
            </span>
          </template>
        </AppSelectButton>
      </div>
    </div>

    <div class="rounded-lg orderbook-h relative bg-gray-1000">
      <div
        class="flex px-4"
        :class="{ 'py-1': activeType === FilterList.Orderbook }"
      >
        <PartialsTradingMarketOrderbookLayoutSelector
          v-if="activeType === FilterList.Orderbook"
        />

        <PartialsTradingMarketOrderbookAggregationSelector
          v-if="activeType === FilterList.Orderbook"
          v-model:aggregation="aggregation"
          class="ml-auto h-6"
          :min-tick="minTick"
          :max-tick="maxTick"
        />
      </div>

      <AppHocLoading class="h-full" :status="status">
        <div
          class="rounded-lg h-full"
          :class="{
            'overflow-y-auto': activeType === FilterList.Trades,
            'orderbook-h-inner': activeType === FilterList.Orderbook
          }"
        >
          <PartialsTradingMarketChart
            v-show="activeType === FilterList.Charts"
            :market="market"
            class="lg:hidden"
          />
          <div v-if="activeType === FilterList.Orderbook">
            <PartialsTradingMarketOrderbookHeader :market="market" />
            <PartialsTradingMarketOrderbookWrapper
              v-bind="{
                market,
                aggregation: Number(aggregation)
              }"
            />
          </div>

          <PartialsTradingMarketTrades
            v-if="activeType === FilterList.Trades"
            :market="market"
          />
        </div>
      </AppHocLoading>
    </div>
  </div>
</template>
