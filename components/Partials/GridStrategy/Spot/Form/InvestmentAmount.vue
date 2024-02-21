<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_DEFAULT_AUTO_GRIDS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { SpotGridTradingField, SpotGridTradingForm } from '@/types'

const props = defineProps({
  isAuto: Boolean,

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const tokenStore = useTokenStore()
const formValues = useFormValues<SpotGridTradingForm>()

const { accountBalancesWithToken } = useBalance()

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const quoteDenomBalance = computed(() =>
  accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )
)

const quoteDenomAmount = computed(() =>
  new BigNumberInWei(quoteDenomBalance.value?.bankBalance || 0).toBase(
    quoteDenomBalance.value?.token.decimals
  )
)

const baseDenomBalance = computed(() =>
  accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.baseDenom
  )
)

const baseDenomAmount = computed(() =>
  new BigNumberInWei(baseDenomBalance.value?.bankBalance || 0).toBase(
    baseDenomBalance.value?.token.decimals
  )
)

const gridThreshold = computed(() => {
  if (props.isAuto) {
    return GST_DEFAULT_AUTO_GRIDS * GST_MIN_TRADING_SIZE
  }

  const isGridHigherThanGridThreshold =
    !!formValues.value[SpotGridTradingField.Grids] &&
    Number(formValues.value[SpotGridTradingField.Grids]) >= GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(formValues.value[SpotGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(GST_MIN_TRADING_SIZE)
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

const { valueToString: quoteAmountToString } = useBigNumberFormatter(
  quoteDenomAmount,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: baseAmountToString } = useBigNumberFormatter(
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
  name: SpotGridTradingField.InvestmentAmount,
  rule: '',
  dynamicRule: computed(() => {
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${SpotGridTradingField.BaseInvestmentAmount}`

    const insuficientRule = `insufficientSgt:${quoteDenomAmount.value.toFixed()}`

    const baseAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.baseToken))

    const quoteAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.InvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.quoteToken))

    const minBaseAndQuoteAmountRule = `minBaseAndQuoteAmountSgt:${baseAmount.toFixed()},${quoteAmount.toFixed()},${gridThreshold.value.toFixed()},${
      props.market.baseToken.symbol
    },${props.market.quoteToken.symbol}`

    const rules = [
      requiredIfFieldEmptyRule,
      insuficientRule,
      minBaseAndQuoteAmountRule
    ]

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
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${SpotGridTradingField.InvestmentAmount}`

    const insuficientRule = `insufficientSgt:${baseDenomAmount.value.toFixed()}`

    const baseAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.baseToken))

    const quoteAmount = new BigNumberInBase(
      formValues.value[SpotGridTradingField.InvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(props.market.quoteToken))

    const minBaseAndQuoteAmountRule = `minBaseAndQuoteAmountSgt:${baseAmount.toFixed()},${quoteAmount.toFixed()},${gridThreshold.value.toFixed()},${
      props.market.baseToken.symbol
    },${props.market.quoteToken.symbol}`

    const rules = [
      requiredIfFieldEmptyRule,
      insuficientRule,
      minBaseAndQuoteAmountRule
    ]

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
    <div class="flex justify-between items-center py-4">
      <div class="flex items-center space-x-2">
        <h3 class="font-bold text-sm tracking-wide">
          <span v-if="!isAuto">3.</span> {{ $t('sgt.amount') }}
        </h3>
        <AppTooltip :content="$t('sgt.investmentTooltip')" />
      </div>

      <button class="bg-gray-800 rounded-md py-2 px-2 flex items-center">
        <div class="ml-auto font-semibold text-xs flex space-x-2 items-center">
          <CommonTokenIcon is-sm :token="market.baseToken" class="w-2" />
          <span>{{ market.baseToken.symbol }}</span>
          <span>+</span>
          <CommonTokenIcon is-sm :token="market.quoteToken" class="w-2" />
          <span>{{ market.quoteToken.symbol }}</span>
        </div>
      </button>
    </div>

    <div class="mb-2">
      <AppInputNumeric
        v-model="investmentAmountValue"
        :is-disabled="isLowerBoundGtLastPrice"
        placeholder="0.00"
        is-disabled-gray
      >
        <template #addon>
          {{ market.quoteToken.symbol }}
        </template>

        <template #context>
          <p class="text-xs font-semibold text-gray-500 mb-2">
            {{ $t('sgt.available') }}
            {{ quoteAmountToString }}
            {{ market.quoteToken.symbol }}
          </p>
        </template>

        <template #postfix>
          <CommonTokenIcon v-bind="{ token: market.quoteToken }" />
        </template>
      </AppInputNumeric>

      <div class="text-red-500 text-xs font-semibold pt-2">
        {{ quoteErrorMessage }}
      </div>
    </div>

    <div>
      <AppInputNumeric
        v-model="baseInvestmentAmountValue"
        placeholder="0.00"
        :is-disabled="isUpperBoundLtLastPrice"
        is-disabled-gray
      >
        <template #addon>
          {{ market.baseToken.symbol }}
        </template>

        <template #context>
          <p class="text-xs font-semibold text-gray-500 mb-2">
            {{ $t('sgt.available') }}
            {{ baseAmountToString }}
            {{ market.baseToken.symbol }}
          </p>
        </template>

        <template #postfix>
          <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        </template>
      </AppInputNumeric>

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
