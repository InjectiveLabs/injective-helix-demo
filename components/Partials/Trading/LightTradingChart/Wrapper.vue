<script setup lang="ts">
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { CandlestickData, Time } from 'lightweight-charts'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  marketId: {
    type: String as PropType<string>,
    required: true
  }
})

const intervalOptions = [
  { label: '1m', value: { countback: 30 * 32, resolution: 1 } },
  { label: '5m', value: { countback: 30 * 32, resolution: 5 } },
  { label: '15m', value: { countback: 30 * 32, resolution: 15 } },
  { label: '30m', value: { countback: 30 * 32, resolution: 30 } },
  { label: '1h', value: { countback: 30 * 32, resolution: 60 } },
  { label: '2h', value: { countback: 30 * 16, resolution: 120 } },
  { label: '4h', value: { countback: 30 * 10, resolution: 240 } },
  { label: '12h', value: { countback: 30 * 10, resolution: 720 } },
  { label: '1D', value: { countback: 30 * 10, resolution: 1440 } }
]

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const exchangeStore = useExchangeStore()

const interval = ref(intervalOptions[4])

const chart = ref()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

const lastTradedPrice = computed(() => {
  return props.isSpot
    ? new BigNumberInWei(spotStore.trades[0]?.price || 0)
        .toBase(
          props.market.quoteToken.decimals - props.market.baseToken.decimals
        )
        .toNumber()
    : new BigNumberInWei(derivativeStore.trades[0]?.executionPrice || 0)
        .toBase(props.market.quoteToken.decimals)
        .toNumber()
})

const candlesticksData = computed(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === props.marketId
  )

  if (!marketHistory) {
    return []
  }

  return marketHistory.time.map((time, index) => ({
    time: time as Time,
    open: marketHistory.openPrice[index],
    high: marketHistory.highPrice[index],
    low: marketHistory.lowPrice[index],
    close: marketHistory.closePrice[index],
    volume: marketHistory.volume[index]
  }))
})

const filteredCandlesticksData = computed(() => {
  if (props.market.slug === 'avax-usdt-perp') {
    return candlesticksData.value.filter(
      (candlestick) => (candlestick.time as number) > 1706682360
    )
  }

  if (props.market.slug === 'zro-usdt-perp') {
    const pastIncidentDate = 1708611555

    return candlesticksData.value.filter((candlestick) => {
      const isDuringTimePeriod = (candlestick.time as number) < pastIncidentDate
      const isHighExceedsThreshold = candlestick.high > 9000

      return !(isDuringTimePeriod && isHighExceedsThreshold)
    })
  }

  if (props.market.slug === 'qunt-inj') {
    return candlesticksData.value.filter(
      (candlestick) => (candlestick.time as number) > 1708960440
    )
  }

  if (props.market.slug === 'w-usdt-perp') {
    return candlesticksData.value.filter(
      ({ time }) => Number(time) > 1709852400
    )
  }

  return candlesticksData.value
})

const visuallyOptimizedCandlesticks = computed(() =>
  filteredCandlesticksData.value.map((candlestick, i, array) => ({
    ...candlestick,
    open: i === 0 ? candlestick.open : array[i - 1].close
  }))
)

const volume = computed(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === props.marketId
  )

  if (!marketHistory) {
    return []
  }

  return visuallyOptimizedCandlesticks.value.map((value, index) => ({
    time: value.time as Time,
    value: value.volume,
    color:
      visuallyOptimizedCandlesticks.value[index].open >
      visuallyOptimizedCandlesticks.value[index].close
        ? '#ef535066'
        : '#26a69a66'
  }))
})

const refetchInterval = computed(
  () => interval.value.value.resolution * 60 * 1000
)

onMounted(() => {
  fetchMarketHistory()
})

function fetchMarketHistory() {
  status.setLoading()

  exchangeStore
    .getMarketsHistoryNew({
      marketIds: [props.marketId],
      countback: interval.value.value.countback,
      resolution: interval.value.value.resolution
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function setInterval(index: number) {
  interval.value = intervalOptions[index]

  fetchMarketHistory()
}

watch(lastTradedPrice, (lastTradedPrice) => {
  if (chart.value) {
    const data = {
      ...candlesticksData.value[candlesticksData.value.length - 1]
    }

    data.close = lastTradedPrice

    chart.value.updateCandlesticksData(data)
  }
})

const tickSize = computed(() =>
  new BigNumberInWei(props.market.minPriceTickSize)
    .toBase(
      props.market.type === MarketType.Spot
        ? props.market.quoteToken.decimals - props.market.baseToken.decimals
        : props.market.quoteToken.decimals
    )
    .toNumber()
)

useIntervalFn(() => {
  exchangeStore
    .getMarketsHistoryNew({
      marketIds: [props.marketId],
      countback: interval.value.value.countback,
      resolution: interval.value.value.resolution
    })
    .catch($onError)
}, refetchInterval)
</script>

<template>
  <div class="p-2 h-full">
    <div class="pb-1 pt-2 flex justify-end">
      <button
        v-for="(option, index) in intervalOptions"
        :key="option.label"
        class="border py-1 text-xs border-gray-800 text-gray-500 w-9 text-center"
        :class="{
          'bg-gray-700 text-white': option.label === interval.label
        }"
        @click="setInterval(index)"
      >
        {{ option.label }}
      </button>
    </div>

    <AppHocLoading v-bind="{ status }" class="h-full">
      <PartialsTradingLightTradingChart
        ref="chart"
        v-bind="{
          candlesticksData:
            visuallyOptimizedCandlesticks as CandlestickData<Time>[],
          volumeData: volume,
          tickSize
        }"
      />
    </AppHocLoading>
  </div>
</template>
