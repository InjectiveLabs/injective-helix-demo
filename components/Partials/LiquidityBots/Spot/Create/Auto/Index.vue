<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { GST_DEFAULT_AUTO_GRIDS } from 'app/utils/constants'
import {
  InvestmentTypeGst,
  SpotGridTradingField,
  SpotGridTradingForm
} from '@/types'

const walletStore = useWalletStore()
const exchangeStore = useExchangeStore()
const gridStrategyStore = useGridStrategyStore()
const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket as UiSpotMarketWithToken)
)

const setFormValues = useSetFormValues()
const liquidityFormValues = useFormValues<SpotGridTradingForm>()

const isAssetRebalancingChecked = ref(true)

const upperPrice = computed(() => {
  const isSingleSided =
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] !==
    InvestmentTypeGst.BaseAndQuote

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Base
  ) {
    return spotLastTradedPrice.value.times(2).toFixed(2)
  }

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
  ) {
    return spotLastTradedPrice.value
      .minus(spotLastTradedPrice.value.times(0.06))
      .toFixed(2)
  }

  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === gridStrategyStore.spotMarket!.marketId
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
    ? minUpperBound.toFixed(2)
    : maxPlusPadding.toFixed(2)
})

const lowerPrice = computed(() => {
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
      .toFixed(2)
  }

  if (
    !isAssetRebalancingChecked.value &&
    isSingleSided &&
    liquidityFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
  ) {
    return spotLastTradedPrice.value.times(0.5).toFixed(2)
  }

  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === gridStrategyStore.spotMarket!.marketId
  )

  if (!marketHistory) {
    return ''
  }

  const min = Math.min(...marketHistory.lowPrice)

  const maxLowerBound = spotLastTradedPrice.value.minus(
    spotLastTradedPrice.value.times(0.06)
  )

  return maxLowerBound.lt(min) ? maxLowerBound.toFixed(2) : min.toFixed(2)
})

const grids = ref(GST_DEFAULT_AUTO_GRIDS)

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

        grids: grids.toFixed()
      }"
      class="mb-4"
    />

    <PartialsLiquidityBotsSpotCreateCommonInvestmentType
      v-bind="{ market: gridStrategyStore.spotMarket }"
    />

    <div class="flex justify-end -mb-4 mt-4">
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
