<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  GST_STABLE_GRIDS,
  SGT_STABLE_COINS,
  GST_DEFAULT_AUTO_GRIDS,
  GST_STABLE_LOWER_PERCENTAGE,
  GST_STABLE_UPPER_PERCENTAGE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { pricesToEma } from '@/app/utils/helpers'
import {
  SpotMarketKey,
  GridStrategyType,
  InvestmentTypeGst,
  UiMarketWithToken,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

const emit = defineEmits<{
  'update:tab': [GridStrategyType]
}>()

const LOWER_BOUND_PERCENTAGE = 0.94
const UPPER_BOUND_PERCENTAGE = 1.06
const SMOOTHING = 3

const market = inject(SpotMarketKey) as Ref<UiMarketWithToken>

const exchangeStore = useExchangeStore()
const setFormValues = useSetFormValues()
const spotGridFormValues = useFormValues<SpotGridTradingForm>()

const isAssetRebalancingChecked = ref(true)

const { lastTradedPrice } = useSpotLastPrice(computed(() => market.value))

const decimalPlaces = computed(() => {
  return market.value.priceDecimals
})

const marketUsesStableCoins = computed(() =>
  [market.value?.baseToken.symbol, market.value?.quoteToken.symbol].some(
    (symbol) => symbol && SGT_STABLE_COINS.includes(symbol.toLowerCase())
  )
)

const upperEma = computed(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (m) => m.marketId === market.value.marketId
  )

  if (!marketHistory) {
    return lastTradedPrice.value.toNumber() * UPPER_BOUND_PERCENTAGE
  }

  return (
    Math.max(
      ...pricesToEma(
        marketHistory.highPrice,
        marketHistory.highPrice.length / SMOOTHING
      )
    ) * UPPER_BOUND_PERCENTAGE
  )
})

const lowerEma = computed(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (m) => m.marketId === market.value.marketId
  )

  if (!marketHistory) {
    return lastTradedPrice.value.toNumber() * LOWER_BOUND_PERCENTAGE
  }

  return (
    Math.min(
      ...pricesToEma(
        marketHistory.lowPrice,
        marketHistory.highPrice.length / SMOOTHING
      )
    ) * LOWER_BOUND_PERCENTAGE
  )
})

const upperPrice = computed(() => {
  if (marketUsesStableCoins.value) {
    return lastTradedPrice.value
      .times(GST_STABLE_UPPER_PERCENTAGE)
      .toFixed(decimalPlaces.value)
  }

  const isSingleSided =
    spotGridFormValues.value[SpotGridTradingField.InvestmentType] !==
    InvestmentTypeGst.BaseAndQuote

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    spotGridFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Base
  ) {
    return lastTradedPrice.value.times(2).toFixed(decimalPlaces.value)
  }

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    spotGridFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
  ) {
    return lastTradedPrice.value
      .minus(lastTradedPrice.value.times(0.06))
      .toFixed(decimalPlaces.value)
  }

  return upperEma.value.toFixed(decimalPlaces.value)
})

const lowerPrice = computed(() => {
  if (marketUsesStableCoins.value) {
    return lastTradedPrice.value
      .times(GST_STABLE_LOWER_PERCENTAGE)
      .toFixed(decimalPlaces.value)
  }

  const isSingleSided =
    spotGridFormValues.value[SpotGridTradingField.InvestmentType] !==
    InvestmentTypeGst.BaseAndQuote

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    spotGridFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Base
  ) {
    return lastTradedPrice.value
      .plus(lastTradedPrice.value.times(0.06))
      .toFixed(decimalPlaces.value)
  }

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    spotGridFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
  ) {
    return lastTradedPrice.value.times(0.5).toFixed(decimalPlaces.value)
  }

  return lowerEma.value.toFixed(decimalPlaces.value)
})

const grids = computed(() =>
  marketUsesStableCoins.value ? GST_STABLE_GRIDS : GST_DEFAULT_AUTO_GRIDS
)

const { valueToString: profitPerGridToString } = useSharedBigNumberFormatter(
  computed(() => {
    if (!lowerPrice.value || !upperPrice.value || !grids.value) {
      return ZERO_IN_BASE
    }

    const priceDifference = new BigNumberInBase(upperPrice.value)
      .minus(lowerPrice.value)
      .dividedBy(grids.value)

    return priceDifference.dividedBy(lowerPrice.value).times(100)
  }),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

watch(
  () => [upperPrice.value, lowerPrice.value, grids.value],
  () => {
    setValuesFromAuto()
  },
  {
    immediate: true
  }
)

function setValuesFromAuto() {
  setFormValues(
    {
      [SpotGridTradingField.UpperPrice]: upperPrice.value,
      [SpotGridTradingField.LowerPrice]: lowerPrice.value,
      [SpotGridTradingField.Grids]: grids.value.toString()
    },
    false
  )
}

function copyToManual() {
  emit('update:tab', GridStrategyType.Manual)
}

onMounted(() => {
  setValuesFromAuto()
})
</script>

<template>
  <div class="border-b pb-4 mb-6">
    <div class="text-xs space-y-2 pt-4 pb-2">
      <p class="text-gray-300">{{ $t('sgt.autoModeHeader') }}</p>
      <div>
        <a
          class="text-blue-500"
          href="https://helixapp.zendesk.com/hc/en-us/articles/8057142539023-Spot-Grid-Trading-on-Helix"
          target="_blank"
        >
          {{ $t('sgt.learnMore') }}
        </a>
      </div>
    </div>

    <div class="text-xs text-gray-500 space-y-4 py-4">
      <div class="flex justify-between">
        <p>{{ $t('sgt.lowerPrice') }}</p>
        <p class="text-white">{{ lowerPrice }} USDT</p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('sgt.upperPrice') }}</p>
        <p class="text-white">{{ upperPrice }} USDT</p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('sgt.gridNumber') }}</p>
        <p class="text-white">{{ grids }}</p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('sgt.profitGrid') }}</p>
        <p class="text-white">{{ profitPerGridToString }}%</p>
      </div>
    </div>

    <button class="text-blue-500" @click="copyToManual">
      {{ $t('sgt.copyParametersToManual') }}
    </button>
  </div>
</template>
