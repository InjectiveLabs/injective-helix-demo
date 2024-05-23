<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_DEFAULT_AUTO_GRIDS,
  GST_MIN_TRADING_SIZE_LOW,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { MARKETS_WITH_LOW_TRADING_SIZE } from '@/app/data/grid-strategy'
import {
  UiSpotMarket,
  InvestmentTypeGst,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

const props = defineProps({
  isAuto: Boolean,

  market: {
    type: Object as PropType<UiSpotMarket>,
    required: true
  }
})

const tokenStore = useTokenStore()
const formValues = useFormValues<SpotGridTradingForm>()

const { userBalancesWithToken } = useBalance()

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const quoteDenomBalance = computed(() =>
  userBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )
)

const quoteDenomAmount = computed(() =>
  sharedToBalanceInTokenInBase({
    value: quoteDenomBalance.value?.bankBalance || 0,
    decimalPlaces: quoteDenomBalance.value?.token.decimals
  })
)

const baseDenomBalance = computed(() =>
  userBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.baseDenom
  )
)

const baseDenomAmount = computed(() =>
  sharedToBalanceInTokenInBase({
    value: baseDenomBalance.value?.bankBalance || 0,
    decimalPlaces: baseDenomBalance.value?.token.decimals
  })
)

const gridThreshold = computed(() => {
  const isLowTradingSize = MARKETS_WITH_LOW_TRADING_SIZE.includes(
    props.market.slug
  )

  const tradingSize = isLowTradingSize
    ? GST_MIN_TRADING_SIZE_LOW
    : GST_MIN_TRADING_SIZE

  if (props.isAuto) {
    return GST_DEFAULT_AUTO_GRIDS * tradingSize
  }

  const isGridHigherThanGridThreshold =
    !!formValues.value[SpotGridTradingField.Grids] &&
    Number(formValues.value[SpotGridTradingField.Grids]) >= GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(formValues.value[SpotGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(tradingSize)
})

const isLowerBoundGtLastPrice = computed(() =>
  lastTradedPrice.value.lt(
    formValues.value[SpotGridTradingField.LowerPrice] || 0
  )
)

const isUpperBoundLtLastPrice = computed(() =>
  lastTradedPrice.value.gt(
    formValues.value[SpotGridTradingField.UpperPrice] || Infinity
  )
)

const { valueToString: quoteAmountToString } = useSharedBigNumberFormatter(
  quoteDenomAmount,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: baseAmountToString } = useSharedBigNumberFormatter(
  baseDenomAmount,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const {
  value: investmentAmountValue,
  errorMessage: quoteErrorMessage,
  setValue: setInvestmentAmount
} = useStringField({
  name: SpotGridTradingField.QuoteInvestmentAmount,
  rule: '',
  dynamicRule: computed(() => {
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${SpotGridTradingField.BaseInvestmentAmount}`

    const insufficientRule = `insufficientSgt:${quoteDenomAmount.value.toFixed()}`

    const baseAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.baseToken))

    const quoteAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.quoteToken))

    const minBaseAndQuoteAmountRule = `minBaseAndQuoteAmountSgt:${baseAmount.toFixed()},${quoteAmount.toFixed()},${gridThreshold.value.toFixed()},${
      props.market.baseToken.symbol
    },${props.market.quoteToken.symbol}`

    const rules = [insufficientRule, minBaseAndQuoteAmountRule]

    if (
      formValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.BaseAndQuote
    ) {
      rules.push(requiredIfFieldEmptyRule)
    }

    if (
      formValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
    ) {
      rules.push('requiredSgt')
    }

    return rules.join('|')
  })
})

const {
  value: baseInvestmentAmountValue,
  errorMessage: baseErrorMessage,
  setValue: setBaseInvestmentAmount
} = useStringField({
  name: SpotGridTradingField.BaseInvestmentAmount,
  rule: '',
  dynamicRule: computed(() => {
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${SpotGridTradingField.QuoteInvestmentAmount}`

    const insufficientRule = `insufficientSgt:${baseDenomAmount.value.toFixed()}`

    const baseAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.baseToken))

    const quoteAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.quoteToken))

    const minBaseAndQuoteAmountRule = `minBaseAndQuoteAmountSgt:${baseAmount.toFixed()},${quoteAmount.toFixed()},${gridThreshold.value.toFixed()},${
      props.market.baseToken.symbol
    },${props.market.quoteToken.symbol}`

    const rules = [insufficientRule, minBaseAndQuoteAmountRule]

    if (
      formValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.BaseAndQuote
    ) {
      rules.push(requiredIfFieldEmptyRule)
    }

    if (
      formValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Base
    ) {
      rules.push('requiredSgt')
    }

    return rules.join('|')
  })
})

watch([isLowerBoundGtLastPrice, isUpperBoundLtLastPrice], () => {
  if (isLowerBoundGtLastPrice.value) {
    setInvestmentAmount('', false)
  }

  if (isUpperBoundLtLastPrice.value) {
    setBaseInvestmentAmount('', false)
  }
})
</script>

<template>
  <div>
    <div
      v-if="
        formValues[SpotGridTradingField.InvestmentType] ===
          InvestmentTypeGst.Quote ||
        formValues[SpotGridTradingField.InvestmentType] ===
          InvestmentTypeGst.BaseAndQuote
      "
      class="mb-2"
    >
      <p class="text-xs font-semibold text-gray-500 mb-2">
        {{ $t('sgt.available') }}
        {{ quoteAmountToString }}
        {{ market.quoteToken.symbol }}
      </p>

      <AppInputField
        v-model="investmentAmountValue"
        :disabled="isLowerBoundGtLastPrice"
        placeholder="0.00"
      >
        <template #right>
          <div class="space-x-2 flex items-center">
            <span>{{ market.quoteToken.symbol }}</span>
            <CommonTokenIcon v-bind="{ token: market.quoteToken }" />
          </div>
        </template>
      </AppInputField>

      <div class="text-red-500 text-xs font-semibold pt-2">
        {{ quoteErrorMessage }}
      </div>
    </div>

    <div
      v-if="
        formValues[SpotGridTradingField.InvestmentType] ===
          InvestmentTypeGst.Base ||
        formValues[SpotGridTradingField.InvestmentType] ===
          InvestmentTypeGst.BaseAndQuote
      "
    >
      <p class="text-xs font-semibold text-gray-500 mb-2">
        {{ $t('sgt.available') }}
        {{ baseAmountToString }}
        {{ market.baseToken.symbol }}
      </p>

      <AppInputField
        v-model="baseInvestmentAmountValue"
        placeholder="0.00"
        :disabled="isUpperBoundLtLastPrice"
      >
        <template #right>
          <div class="space-x-2 flex items-center">
            <span>{{ market.baseToken.symbol }}</span>
            <CommonTokenIcon v-bind="{ token: market.baseToken }" />
          </div>
        </template>
      </AppInputField>

      <div class="text-red-500 text-xs font-semibold pt-2">
        {{ baseErrorMessage }}
      </div>
    </div>

    <div class="text-xs font-semibold text-gray-500 mt-4 space-y-2">
      <p>{{ $t('sgt.minInvestment', { amount: gridThreshold.toFixed() }) }}</p>
      <p>
        {{
          $t('sgt.totalBaseAndQuote', {
            base: market.baseToken.symbol.toUpperCase(),
            quote: market.quoteToken.symbol.toUpperCase(),
            amount: gridThreshold
          })
        }}
      </p>
    </div>
  </div>
</template>
