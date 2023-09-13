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

function setQuoteAndBaseType() {
  selectedInvestmentType.value = InvestmentTypeGst.BaseAndQuote
  baseResetField({ value: '' })
}

function setQuoteType() {
  selectedInvestmentType.value = InvestmentTypeGst.Quote
  baseResetField({ value: '' })
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center py-4">
      <div class="flex items-center space-x-2">
        <h3 class="font-bold text-sm tracking-wide">
          3. {{ $t('sgt.investment') }}
        </h3>
        <AppTooltip :content="$t('sgt.investmentTooltip')" />
      </div>

      <BaseDropdown v-if="baseDenomAmount.gt(0)">
        <template #default="{ isOpen }">
          <button class="bg-gray-800 rounded-md py-2 px-2 flex items-center">
            <div
              v-if="
                formValues[SpotGridTradingField.InvestmentType] ===
                InvestmentTypeGst.Quote
              "
              class="ml-auto font-semibold text-xs flex space-x-2 items-center"
            >
              <CommonTokenIcon sm :token="market.quoteToken" class="w-2" />
              <span>{{ market.quoteToken.symbol }}</span>
            </div>

            <div
              v-if="
                formValues[SpotGridTradingField.InvestmentType] ===
                InvestmentTypeGst.BaseAndQuote
              "
              class="ml-auto font-semibold text-xs flex space-x-2 items-center"
            >
              <CommonTokenIcon sm :token="market.baseToken" class="w-2" />
              <span>{{ market.baseToken.symbol }}</span>
              <span>+</span>
              <CommonTokenIcon sm :token="market.quoteToken" class="w-2" />
              <span>{{ market.quoteToken.symbol }}</span>
            </div>

            <div
              class="ml-2 transition-all duration-300"
              :class="{ 'rotate-180': isOpen }"
            >
              <BaseIcon class="w-3 h-3" name="chevron-down" />
            </div>
          </button>
        </template>

        <template #content="{ close }">
          <div class="bg-gray-800 text-white" @click="close">
            <div
              class="font-semibold text-xs flex justify-end space-x-2 items-center p-2 hover:bg-gray-700 hover:cursor-pointer"
              @click="setQuoteType"
            >
              <CommonTokenIcon sm :token="market.quoteToken" class="w-2" />
              <span>{{ market.quoteToken.symbol }}</span>
            </div>

            <div
              class="font-semibold text-xs flex space-x-2 items-center p-2 hover:bg-gray-700 hover:cursor-pointer"
              @click="setQuoteAndBaseType"
            >
              <CommonTokenIcon sm :token="market.baseToken" class="w-2" />
              <span>{{ market.baseToken.symbol }}</span>
              <span>+</span>
              <CommonTokenIcon sm :token="market.quoteToken" class="w-2" />
              <span>{{ market.quoteToken.symbol }}</span>
            </div>
          </div>
        </template>
      </BaseDropdown>
    </div>

    <div class="mb-2">
      <AppInputNumeric
        v-model="investmentAmountValue"
        class="text-right"
        :placeholder="`≥ ${minQuoteAmount}`"
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
      </AppInputNumeric>

      <div class="text-red-500 text-xs font-semibold pt-2">
        {{ quoteErrorMessage }}
      </div>
    </div>

    <div v-if="selectedInvestmentType === InvestmentTypeGst.BaseAndQuote">
      <AppInputNumeric v-model="baseInvestmentAmountValue" class="text-right">
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
      </AppInputNumeric>

      <div class="text-red-500 text-xs font-semibold pt-2">
        {{ baseErrorMessage }}
      </div>
    </div>
  </div>
</template>
