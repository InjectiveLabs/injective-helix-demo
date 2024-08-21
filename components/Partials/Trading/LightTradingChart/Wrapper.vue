<script setup lang="ts">
import { SharedMarketType } from '@shared/types'
import { CandlestickData, Time } from 'lightweight-charts'
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { intervalOptions } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
    marketId: string
    interval: number
  }>(),
  {
    isSpot: false
  }
)

const exchangeStore = useExchangeStore()

const chart = ref()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)
const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const lastTradedPrice = computed(() => {
  return props.isSpot
    ? spotLastTradedPrice.value
    : derivativeLastTradedPrice.value
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
    const pastIncidentDate = 1715299200

    return candlesticksData.value.filter((candlestick) => {
      const isDuringTimePeriod = (candlestick.time as number) < pastIncidentDate
      const isHighExceedsThreshold = candlestick.high > 37

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

  if (props.market.slug === 'black-inj') {
    return candlesticksData.value.filter(
      ({ time }) => Number(time) > 1713546300
    )
  }

  if (props.market.slug === 'mother-inj') {
    return candlesticksData.value.filter(
      ({ time }) => Number(time) > 1717271688
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
    .then(updateLastBarWithLastTradedPrice)
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

watch(() => lastTradedPrice.value, updateLastBarWithLastTradedPrice)

const tickSize = computed(() =>
  new BigNumberInWei(props.market.minPriceTickSize)
    .toBase(
      props.market.type === SharedMarketType.Spot
        ? props.market.quoteToken.decimals - props.market.baseToken.decimals
        : props.market.quoteToken.decimals
    )
    .toNumber()
)

function updateLastBarWithLastTradedPrice() {
  if (
    chart.value &&
    candlesticksData.value.length > 0 &&
    !lastTradedPrice.value.eq(0)
  ) {
    const data = {
      ...candlesticksData.value[candlesticksData.value.length - 1]
    }

    data.close = lastTradedPrice.value.toNumber()

    chart.value.updateCandlesticksData(data)
  }
}

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
        @chart:ready="updateLastBarWithLastTradedPrice"
      />
    </AppHocLoading>
  </div>
</template>
