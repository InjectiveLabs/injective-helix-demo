<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  InvestmentTypeGst,
  SpotGridTradingField,
  SpotGridTradingForm
} from '@/types'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  GST_MIN_TRADING_SIZE
} from '@/app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const formValues = useFormValues<SpotGridTradingForm>()
const { accountBalancesWithToken } = useBalance()

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

const options = computed(() => [
  {
    display: props.market.quoteToken.symbol,
    value: InvestmentTypeGst.Quote
  },
  {
    display: `${props.market.baseToken.symbol} + ${props.market.quoteToken.symbol}`,
    value: InvestmentTypeGst.BaseAndQuote
  }
])

const minQuoteAmount = computed(() =>
  new BigNumberInBase(formValues.value.grids || 1)
    .times(GST_MIN_TRADING_SIZE)
    .toFixed(2)
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

const { value: selectedInvestmentType } = useStringField({
  name: SpotGridTradingField.InvestmentType,
  initialValue: InvestmentTypeGst.Quote
})

const { value: investmentAmountValue, errorMessage: quoteErrorMessage } =
  useStringField({
    name: SpotGridTradingField.InvestmentAmount,
    rule: 'requiredSgt',
    dynamicRule: computed(
      () =>
        `minInvestmentSgt:${
          minQuoteAmount.value
        }|insufficientSgt:${quoteDenomAmount.value.toFixed()}`
    )
  })

const {
  value: baseInvestmentAmountValue,
  errorMessage: baseErrorMessage,
  resetField: baseResetField
} = useStringField({
  name: SpotGridTradingField.BaseInvestmentAmount,
  rule: '',
  dynamicRule: computed(
    () =>
      `${
        selectedInvestmentType.value === InvestmentTypeGst.BaseAndQuote
          ? 'requiredSgt|'
          : ''
      }minValueSgt:1|insufficientSgt:${baseDenomAmount.value.toFixed()}`
  )
})

function onInvestmentTypeUpdate() {
  baseResetField({ value: '' })
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center py-4">
      <div class="flex items-center space-x-2">
        <h3 class="text-lg font-semibold">Investment</h3>
        <AppTooltip :content="$t('sgt.investmentTooltip')" />
      </div>

      <AppSelect
        v-if="baseDenomAmount.gt(0)"
        v-model="selectedInvestmentType"
        no-min-w
        v-bind="{
          options,
          wrapperClass: 'bg-gray-800 rounded-md py-2 px-4'
        }"
        @update:model-value="onInvestmentTypeUpdate"
      >
        <template #default>
          <div
            v-if="formValues.InvestmentType === InvestmentTypeGst.Quote"
            class="ml-auto font-semibold flex space-x-2 items-center"
          >
            <CommonTokenIcon sm :token="market.quoteToken" />
            <span>{{ market.quoteToken.symbol }}</span>
          </div>

          <div
            v-if="formValues.InvestmentType === InvestmentTypeGst.BaseAndQuote"
            class="ml-auto font-semibold flex space-x-2 items-center"
          >
            <CommonTokenIcon sm :token="market.baseToken" />
            <span>{{ market.baseToken.symbol }}</span>
            <span>+</span>
            <CommonTokenIcon sm :token="market.quoteToken" />
            <span>{{ market.quoteToken.symbol }}</span>
          </div>
        </template>

        <template #option="{ option }">
          <div
            v-if="option.value === InvestmentTypeGst.Quote"
            class="ml-auto font-semibold flex space-x-2 items-center"
          >
            <CommonTokenIcon sm :token="market.quoteToken" />
            <span>{{ option?.display }}</span>
          </div>

          <div
            v-if="option.value === InvestmentTypeGst.BaseAndQuote"
            class="ml-auto font-semibold flex space-x-2 items-center"
          >
            <CommonTokenIcon sm :token="market.baseToken" />
            <span>{{ market.baseToken.symbol }}</span>
            <span>+</span>
            <CommonTokenIcon sm :token="market.quoteToken" />
            <span>{{ market.quoteToken.symbol }}</span>
          </div>
        </template>
      </AppSelect>
    </div>

    <div class="mb-4">
      <div class="flex justify-between items-center">
        <p class="text-xs font-semibold text-gray-200 mb-2">
          {{ $t('sgt.investmentAmount') }}
        </p>
        <p class="text-xs font-semibold text-gray-500 mb-2">
          {{ $t('sgt.available') }}
          {{ quoteAmountToString }}
          {{ market.quoteToken.symbol }}
        </p>
      </div>

      <AppInputNumeric
        v-model="investmentAmountValue"
        class="text-right"
        :placeholder="`≥ ${minQuoteAmount}`"
      >
        <template #addon>
          {{ market.quoteToken.symbol }}
        </template>
      </AppInputNumeric>

      <div class="text-red-500 text-xs font-semibold pt-2">
        {{ quoteErrorMessage }}
      </div>
    </div>

    <div v-if="selectedInvestmentType === InvestmentTypeGst.BaseAndQuote">
      <div class="flex justify-between items-center">
        <p class="text-xs font-semibold text-gray-200 mb-2">
          {{ $t('sgt.investmentAmount') }}
        </p>
        <p class="text-xs font-semibold text-gray-500 mb-2">
          {{ $t('sgt.available') }}
          {{ baseAmountToString }}
          {{ market.baseToken.symbol }}
        </p>
      </div>

      <AppInputNumeric v-model="baseInvestmentAmountValue" class="text-right">
        <template #addon>
          {{ market.baseToken.symbol }}
        </template>
      </AppInputNumeric>

      <div class="text-red-500 text-xs font-semibold pt-2">
        {{ baseErrorMessage }}
      </div>
    </div>
  </div>
</template>
