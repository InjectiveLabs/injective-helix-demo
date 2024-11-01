<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  SharedMarketType,
  SharedMarketChange,
  SharedUiMarketHistory
} from '@shared/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { getFormattedMarketsHistoryChartData } from '@/app/utils/market'

const exchangeStore = useExchangeStore()

const props = withDefaults(
  defineProps<{
    market: UiMarketAndSummaryWithVolumeInUsd
  }>(),
  {}
)

const lastTradedPrice = computed(() => {
  if (!props.market.summary || !props.market.summary.price) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    props.market.summary.lastPrice || props.market.summary.price
  )
})

const change = computed(() => {
  if (!props.market.summary || !props.market.summary.change) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.market.summary.change)
})

const chartData = computed(() => {
  if (exchangeStore.marketsHistory.length === 0 || !props.market) {
    return []
  }

  const matchingMarket = exchangeStore.marketsHistory.find(
    (marketHistory: SharedUiMarketHistory) => {
      return marketHistory.marketId === props.market.market.marketId
    }
  )

  if (!matchingMarket) {
    return []
  }

  return getFormattedMarketsHistoryChartData(matchingMarket)
})

const chartIsPositive = computed(() => {
  const minimumChartDataPoints = 2

  if (chartData.value.length < minimumChartDataPoints) {
    return ''
  }

  const [firstChartDataPoint] = chartData.value
  const lastChartDataPointPosition = new BigNumberInBase(chartData.value.length)
    .minus(1)
    .toNumber()
  const [, firstYaxisHolcPrice] = firstChartDataPoint
  const [, lastYAxisHolcPrice] = chartData.value[lastChartDataPointPosition]

  return new BigNumberInBase(lastYAxisHolcPrice).gte(firstYaxisHolcPrice)
})

const to = computed(() =>
  props.market.market.type === SharedMarketType.Spot
    ? { name: 'spot-slug', params: { slug: props.market.market.slug } }
    : { name: 'futures-slug', params: { slug: props.market.market.slug } }
)

const { valueToFixed: volumeInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() => props.market.volumeInUsd),
  {
    decimalPlaces: 2
  }
)

const { valueToFixed: lastTradedPriceToFixed } = useSharedBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces:
      props.market?.market.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: changeToFormat } = useSharedBigNumberFormatter(change, {
  decimalPlaces: 2
})
</script>

<template>
  <NuxtLink
    v-bind="{ to }"
    class="border border-brand-800 px-4 py-2 rounded-lg"
  >
    <div class="flex justify-between">
      <div class="flex items-center space-x-2 overflow-hidden">
        <CommonTokenIcon v-bind="{ token: market.market.baseToken }" is-sm />
        <p class="text-sm tracking-wide truncate min-w-0">
          {{ market.market.ticker }}
        </p>
      </div>
      <div class="w-16 h-8 ml-auto">
        <SharedLineGraph
          v-if="chartData.length > 1"
          :data="chartData"
          :color="chartIsPositive ? '#0BB67D' : '#F3164D'"
          :stroke-width="1"
        />
      </div>
    </div>

    <div class="flex items-center justify-start mt-2">
      <p
        class="text-sm tracking-wide font-mono font-semibold flex items-center mr-2"
        data-cy="market-card-last-traded-price-text-content"
        :class="{
          'text-green-500 ':
            market.summary.lastPriceChange === SharedMarketChange.Increase,
          'text-white':
            market.summary.lastPriceChange === SharedMarketChange.NoChange,
          'text-red-500':
            market.summary.lastPriceChange === SharedMarketChange.Decrease
        }"
      >
        <AppAmount
          v-bind="{
            amount: lastTradedPriceToFixed
          }"
        />
      </p>

      <span
        class="text-xs font-mono"
        data-cy="market-card-change_24h-text-content"
        :class="{
          'text-green-500': change.gt(0),
          'text-white': change.eq(0),
          'text-red-500': change.lt(0)
        }"
      >
        {{ changeToFormat }}%
      </span>
    </div>

    <span
      class="text-coolGray-500 w-full text-xs"
      data-cy="market-card-volume-usd-text-content"
    >
      {{ $t('markets.vol') }}
      <span class="font-mono">
        <AppUsdAmount
          v-bind="{
            amount: volumeInUsdToFixed
          }"
        />
      </span>
      USD
    </span>
  </NuxtLink>
</template>
