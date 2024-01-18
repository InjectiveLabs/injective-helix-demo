<script lang="ts" setup>
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { GridStrategyType, SpotGridTradingField } from '@/types'
import {
  GST_AUTO_PRICE_THRESHOLD,
  GST_DEFAULT_AUTO_GRIDS,
  GST_STABLE_GRIDS,
  GST_STABLE_LOWER_PRICE,
  GST_STABLE_UPPER_PRICE,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { KAVA_USDT_SYMBOL, STINJ_USDT_SYMBOL } from '@/app/data/token'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const emit = defineEmits<{
  'update:tab': [tab: GridStrategyType]
}>()

const exchangeStore = useExchangeStore()
const setFormValues = useSetFormValues()
const gridStrategyStore = useGridStrategyStore()
const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const decimalsPlaces = computed(() =>
  lastTradedPrice.value.isGreaterThan(GST_AUTO_PRICE_THRESHOLD)
    ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
    : UI_DEFAULT_MAX_DISPLAY_DECIMALS
)

const marketUsesStableCoins = computed(() =>
  [
    gridStrategyStore.spotMarket?.baseToken.symbol,
    gridStrategyStore.spotMarket?.quoteToken.symbol
  ].some(
    (symbol) =>
      symbol &&
      [
        KAVA_USDT_SYMBOL.toLowerCase(),
        STINJ_USDT_SYMBOL.toLowerCase()
      ].includes(symbol.toLowerCase())
  )
)

const upperPrice = computed(() => {
  if (marketUsesStableCoins.value) {
    return GST_STABLE_UPPER_PRICE
  }

  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === props.market.marketId
  )

  if (!marketHistory) {
    return ''
  }

  const max = Math.max(...marketHistory.highPrice)
  const maxPlusPadding = max + max * 0.05

  const minUpperBound = spotLastTradedPrice.value.plus(
    spotLastTradedPrice.value.times(0.06)
  )

  return minUpperBound.gt(max)
    ? minUpperBound.toFixed(decimalsPlaces.value)
    : maxPlusPadding.toFixed(decimalsPlaces.value)
})

const lowerPrice = computed(() => {
  if (marketUsesStableCoins.value) {
    return GST_STABLE_LOWER_PRICE
  }

  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === props.market.marketId
  )

  if (!marketHistory) {
    return ''
  }

  const min = Math.min(...marketHistory.lowPrice)

  const maxLowerBound = spotLastTradedPrice.value.minus(
    spotLastTradedPrice.value.times(0.06)
  )

  return maxLowerBound.lt(min)
    ? maxLowerBound.toFixed(decimalsPlaces.value)
    : min.toFixed(decimalsPlaces.value)
})

const grids = computed(() =>
  marketUsesStableCoins.value ? GST_STABLE_GRIDS : GST_DEFAULT_AUTO_GRIDS
)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)

const profitPerGrid = computed(() => {
  if (!lowerPrice.value || !upperPrice.value || !grids.value) {
    return ZERO_IN_BASE
  }

  const priceDifference = new BigNumberInBase(upperPrice.value)
    .minus(lowerPrice.value)
    .dividedBy(grids.value)

  return priceDifference.dividedBy(lowerPrice.value).times(100)
})

const { valueToString: upperPriceToString } = useBigNumberFormatter(
  upperPrice,
  { decimalPlaces: decimalsPlaces.value }
)

const { valueToString: lowerPriceToString } = useBigNumberFormatter(
  lowerPrice,
  { decimalPlaces: decimalsPlaces.value }
)

const { valueToString: profitPerGridToString } = useBigNumberFormatter(
  profitPerGrid,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

function copyToManual() {
  setValuesFromAuto()
  emit('update:tab', GridStrategyType.Manual)
}

function setValuesFromAuto() {
  setFormValues(
    {
      [SpotGridTradingField.UpperPrice]: upperPrice.value,
      [SpotGridTradingField.LowerPrice]: lowerPrice.value,
      [SpotGridTradingField.Grids]: grids.value
    },
    false
  )
}

onMounted(() => {
  setFormValues(
    {
      [SpotGridTradingField.UpperPrice]: '',
      [SpotGridTradingField.LowerPrice]: '',
      [SpotGridTradingField.Grids]: ''
    },
    false
  )
})
</script>

<template>
  <div>
    <p class="text-xs">{{ $t('sgt.autoModeHeader') }}</p>
    <NuxtLink
      to="https://helixapp.zendesk.com/hc/en-us/articles/8057142539023-Spot-Grid-Trading-on-Helix-"
      target="_blank"
      class="text-xs text-blue-500"
    >
      {{ $t('sgt.learnMore') }}.
    </NuxtLink>

    <div class="space-y-4 my-4">
      <div class="flex justify-between items-center text-sm">
        <p class="text-gray-500">{{ $t('sgt.lowerPrice') }}</p>
        <p>{{ lowerPriceToString }} USDT</p>
      </div>

      <div class="flex justify-between items-center text-sm">
        <p class="text-gray-500">{{ $t('sgt.upperPrice') }}</p>
        <p>{{ upperPriceToString }} USDT</p>
      </div>

      <div class="flex justify-between items-center text-sm">
        <p class="text-gray-500">{{ $t('sgt.gridNumber') }}</p>
        <p>{{ grids }}</p>
      </div>

      <div class="flex justify-between items-center text-sm">
        <p class="text-gray-500">{{ $t('sgt.profitGrid') }}</p>
        <p>{{ profitPerGridToString }}%</p>
      </div>
    </div>

    <button class="text-blue-500 font-semibold" @click="copyToManual">
      {{ $t('sgt.copyParametersToManual') }}
    </button>

    <div class="border border-t-gray-700 my-4" />

    <PartialsGridStrategySpotFormInvestmentAmount v-bind="{ market }" is-auto />

    <PartialsGridStrategySpotFormCreate
      class="mt-4"
      v-bind="{ market }"
      @strategy:create="setValuesFromAuto"
    />
  </div>
</template>
