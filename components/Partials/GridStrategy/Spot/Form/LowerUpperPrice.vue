<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { SpotGridTradingField, SpotGridTradingForm } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const gridStrategyStore = useGridStrategyStore()

const formValues = useFormValues<SpotGridTradingForm>()
const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)

const { value: lowerPriceValue, errorMessage: lowerErrorMessage } =
  useStringField({
    name: SpotGridTradingField.LowerPrice,
    rule: '',
    dynamicRule: computed(() => {
      const greaterThanRule = `greaterThanSgt:0`

      const singleSidedRule = `singleSided:@${
        SpotGridTradingField.LowerPrice
      },@${SpotGridTradingField.UpperPrice},${spotLastTradedPrice.value.toFixed(
        2
      )},${SpotGridTradingField.LowerPrice}`

      const rules = ['requiredSgt', greaterThanRule, singleSidedRule]

      return rules.join('|')
    })
  })

const { value: upperPriceValue, errorMessage: upperErrorMessage } =
  useStringField({
    name: SpotGridTradingField.UpperPrice,
    rule: '',
    dynamicRule: computed(() => {
      const greaterThanRule = `greaterThanSgt:${
        formValues.value[SpotGridTradingField.LowerPrice] || 0
      }`

      const singleSidedRule = `singleSided:@${
        SpotGridTradingField.LowerPrice
      },@${SpotGridTradingField.UpperPrice},${spotLastTradedPrice.value.toFixed(
        2
      )},${SpotGridTradingField.UpperPrice}`

      const rules = ['requiredSgt', greaterThanRule, singleSidedRule]

      return rules.join('|')
    })
  })
</script>

<template>
  <div>
    <p class="font-bold text-sm tracking-wide pb-4">
      1. {{ $t('sgt.priceRange') }}
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <AppInputNumeric v-model="lowerPriceValue" placeholder="0.00">
          <template #context>
            <p class="text-xs font-light text-gray-200 mb-2">
              {{ $t('sgt.lower') }}
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
        <AppInputNumeric v-model="upperPriceValue" placeholder="0.00">
          <template #context>
            <p class="text-xs font-light text-gray-200 mb-2">
              {{ $t('sgt.upper') }}
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
