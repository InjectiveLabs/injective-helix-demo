<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import {
  GST_DEFAULT_AUTO_GRIDS,
  GST_STABLE_GRIDS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  GST_AUTO_PRICE_THRESHOLD,
  GST_STABLE_LOWER_PERCENTAGE,
  GST_STABLE_UPPER_PERCENTAGE
} from '@/app/utils/constants'
import {
  InvestmentTypeGst,
  SpotGridTradingField,
  SpotGridTradingForm
} from '@/types'
import { pricesToEma } from '@/app/utils/helpers'
import { KAVA_USDT_SYMBOL, STINJ_USDT_SYMBOL } from '@/app/data/token'

const walletStore = useWalletStore()
const exchangeStore = useExchangeStore()
const gridStrategyStore = useGridStrategyStore()
const setFormValues = useSetFormValues()
const liquidityFormValues = useFormValues<SpotGridTradingForm>()
const { lastTradedPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket as UiSpotMarketWithToken)
)

const LOWER_BOUND_PERCENTAGE = 0.94
const UPPER_BOUND_PERCENTAGE = 1.06
const SMOOTHING = 3

const isAssetRebalancingChecked = ref(true)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket as UiSpotMarketWithToken)
)

const decimalPlaces = computed(() =>
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

const upperEma = computed(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (m) => m.marketId === gridStrategyStore.spotMarket?.marketId
  )

  if (!marketHistory) {
    return spotLastTradedPrice.value.toNumber() * UPPER_BOUND_PERCENTAGE
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
    (m) => m.marketId === gridStrategyStore.spotMarket?.marketId
  )

  if (!marketHistory) {
    return spotLastTradedPrice.value.toNumber() * LOWER_BOUND_PERCENTAGE
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
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] !==
    InvestmentTypeGst.BaseAndQuote

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Base
  ) {
    return spotLastTradedPrice.value.times(2).toFixed(decimalPlaces.value)
  }

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
  ) {
    return spotLastTradedPrice.value
      .minus(spotLastTradedPrice.value.times(0.06))
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
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] !==
    InvestmentTypeGst.BaseAndQuote

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Base
  ) {
    return spotLastTradedPrice.value
      .plus(spotLastTradedPrice.value.times(0.06))
      .toFixed(decimalPlaces.value)
  }

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
  ) {
    return spotLastTradedPrice.value.times(0.5).toFixed(decimalPlaces.value)
  }

  return lowerEma.value.toFixed(decimalPlaces.value)
})

const grids = computed(() =>
  marketUsesStableCoins.value ? GST_STABLE_GRIDS : GST_DEFAULT_AUTO_GRIDS
)

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
</script>

<template>
  <div v-if="gridStrategyStore.spotMarket">
    <PartialsLiquidityBotsSpotCreateAutoParameters
      v-bind="{
        market: gridStrategyStore.spotMarket,
        upperPrice,
        lowerPrice,
        decimalPlaces,
        grids: grids.toFixed()
      }"
      class="mb-4"
    />

    <PartialsLiquidityBotsSpotCreateCommonInvestmentType
      v-bind="{ market: gridStrategyStore.spotMarket }"
    />

    <div class="flex justify-end mb-2 sm:-mb-4 mt-4">
      <div
        v-if="
          liquidityFormValues[SpotGridTradingField.InvestmentType] !==
          InvestmentTypeGst.BaseAndQuote
        "
        class="flex items-center"
      >
        <AppCheckbox v-model="isAssetRebalancingChecked" />

        <p class="mr-2 text-xs font-semibold">
          {{ $t('liquidity.allowAssetRebalance') }}
        </p>

        <AppTooltip
          v-bind="{
            content: $t('liquidity.allowAssetRebalanceTooltip')
          }"
        />
      </div>
    </div>

    <PartialsLiquidityBotsSpotCreateCommonInvestmentAmount
      v-bind="{ market: gridStrategyStore.spotMarket }"
      class="mb-4"
      is-auto
    />

    <CommonUserNotConnectedNote v-if="!walletStore.isUserWalletConnected" cta />

    <PartialsLiquidityBotsSpotCreateCommonCreateStrategy
      v-else
      v-bind="{ market: gridStrategyStore.spotMarket }"
      @strategy:create="setValuesFromAuto"
    />
  </div>
</template>
