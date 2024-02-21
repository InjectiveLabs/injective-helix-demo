<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { SpotGridTradingField, SpotGridTradingForm } from '@/types'
import {
  GST_SINGLE_SIDED_THRESHOLD,
  GST_KAVA_SINGLE_SIDED_THRESHOLD
} from '@/app/utils/constants'
import { KAVA_USDT_SYMBOL, STINJ_USDT_SYMBOL } from '@/app/data/token'

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

const { value: lowerPriceValue, errorMessage: lowerErrorMessage } =
  useStringField({
    name: SpotGridTradingField.LowerPrice,
    rule: '',
    dynamicRule: computed(() => {
      const greaterThanRule = `greaterThanSgt:0`

      const singleSidedRule = `singleSided:@${
        SpotGridTradingField.LowerPrice
      },@${
        SpotGridTradingField.UpperPrice
      },${spotLastTradedPrice.value.toFixed()},${
        SpotGridTradingField.LowerPrice
      },${
        marketUsesStableCoins.value
          ? GST_KAVA_SINGLE_SIDED_THRESHOLD
          : GST_SINGLE_SIDED_THRESHOLD
      }`

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
      },@${
        SpotGridTradingField.UpperPrice
      },${spotLastTradedPrice.value.toFixed()},${
        SpotGridTradingField.UpperPrice
      },${
        marketUsesStableCoins.value
          ? GST_KAVA_SINGLE_SIDED_THRESHOLD
          : GST_SINGLE_SIDED_THRESHOLD
      }`

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
        <AppInputNumeric
          v-model="lowerPriceValue"
          placeholder="0.00"
          v-bind="{ maxDecimals: market.priceDecimals }"
        >
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
        <AppInputNumeric
          v-model="upperPriceValue"
          placeholder="0.00"
          v-bind="{ maxDecimals: market.priceDecimals }"
        >
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
