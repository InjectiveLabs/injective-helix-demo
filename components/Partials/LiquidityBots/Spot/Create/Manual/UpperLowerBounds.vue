<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { InvestmentTypeGst, SpotGridTradingField } from '@/types'

const props = defineProps({
  isRebalanceBeforeCreationChecked: Boolean,

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues()

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const {
  value: lowerPriceValue,
  errorMessage: lowerErrorMessage,
  validate: validateUpper
} = useStringField({
  name: SpotGridTradingField.LowerPrice,
  rule: '',
  dynamicRule: computed(() => {
    const greaterThanValue =
      !props.isRebalanceBeforeCreationChecked &&
      formValues.value[SpotGridTradingField.InvestmentType] ===
        InvestmentTypeGst.Quote
        ? lastTradedPrice.value.toNumber()
        : 0
    const greaterThanRule = `greaterThanSgt:${greaterThanValue}`

    const singleSidedRule = `singleSided:@${SpotGridTradingField.LowerPrice},@${
      SpotGridTradingField.UpperPrice
    },${lastTradedPrice.value.toFixed(2)},${SpotGridTradingField.LowerPrice}`

    const rules = ['requiredSgt', greaterThanRule, singleSidedRule]

    return rules.join('|')
  })
})

const {
  value: upperPriceValue,
  errorMessage: upperErrorMessage,
  validate: validateLower
} = useStringField({
  name: SpotGridTradingField.UpperPrice,
  rule: '',
  dynamicRule: computed(() => {
    const lessThanRule = `lessThanSgt:${lastTradedPrice.value.toNumber()}`

    const greaterThanRule = `greaterThanSgt:${
      formValues.value[SpotGridTradingField.LowerPrice] || 0
    }`

    const singleSidedRule = `singleSided:@${SpotGridTradingField.LowerPrice},@${
      SpotGridTradingField.UpperPrice
    },${lastTradedPrice.value.toFixed(2)},${SpotGridTradingField.UpperPrice}`

    const rules = ['requiredSgt', greaterThanRule, singleSidedRule]

    if (
      !props.isRebalanceBeforeCreationChecked &&
      formValues.value[SpotGridTradingField.InvestmentType] ===
        InvestmentTypeGst.Base
    ) {
      rules.push(lessThanRule)
    }

    return rules.join('|')
  })
})

watch(
  () => props.isRebalanceBeforeCreationChecked,
  () => {
    validateLower({ mode: 'force' })
    validateUpper({ mode: 'force' })
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <p class="font-bold text-sm tracking-wide py-4">
      {{ $t('sgt.priceRange') }}
    </p>

    <div class="grid grid-cols-1 gap-4 mb-4">
      <div>
        <AppInputNumeric
          v-model="lowerPriceValue"
          placeholder="0.00"
          class="text-right"
        >
          <template #context>
            <p class="text-xs font-light text-gray-200 mb-2">
              {{ $t('sgt.lowerPrice') }}
            </p>
          </template>

          <template #addon>
            <span v-if="gridStrategyStore.spotMarket">
              {{ gridStrategyStore.spotMarket.quoteToken.symbol }}
            </span>
          </template>
        </AppInputNumeric>

        <div class="text-red-500 text-xs font-semibold mt-2">
          {{ lowerErrorMessage }}
        </div>
      </div>

      <div>
        <AppInputNumeric
          v-model="upperPriceValue"
          placeholder="0.00"
          class="text-right"
        >
          <template #context>
            <p class="text-xs font-light text-gray-200 mb-2">
              {{ $t('sgt.upperPrice') }}
            </p>
          </template>

          <template #addon>
            <span v-if="gridStrategyStore.spotMarket">
              {{ gridStrategyStore.spotMarket.quoteToken.symbol }}
            </span>
          </template>
        </AppInputNumeric>

        <div class="text-red-500 text-xs font-semibold mt-2">
          {{ upperErrorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
