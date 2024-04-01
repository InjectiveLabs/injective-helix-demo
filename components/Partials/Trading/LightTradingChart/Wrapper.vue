<script setup lang="ts">
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { CandlestickData, Time } from 'lightweight-charts'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'
import { intervalOptions } from '@/app/utils/constants'

const props = defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  marketId: {
    type: String as PropType<string>,
    required: true
  },

  interval: {
    type: Number,
    required: true
  }
})

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const exchangeStore = useExchangeStore()

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
  () => intervalOptions[props.interval].value.resolution * 60 * 1000
)

onMounted(() => {
  fetchMarketHistory()
})

function fetchMarketHistory() {
  status.setLoading()

  exchangeStore
    .fetchMarketHistoryNew({
      marketIds: [props.marketId],
      countback: intervalOptions[props.interval].value.countback,
      resolution: intervalOptions[props.interval].value.resolution
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(
  () => intervalOptions[props.interval],
  () => {
    fetchMarketHistory()
  }
)

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
    .fetchMarketHistoryNew({
      marketIds: [props.marketId],
      countback: intervalOptions[props.interval].value.countback,
      resolution: intervalOptions[props.interval].value.resolution
    })
    .catch($onError)
}, refetchInterval)
</script>

<template>
  <div class="relative flex flex-col flex-1">
    <AppHocLoading v-bind="{ status }" is-helix>
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
