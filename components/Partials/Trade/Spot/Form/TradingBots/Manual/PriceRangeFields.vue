<script setup lang="ts">
import {
  SGT_STABLE_COINS,
  GST_SINGLE_SIDED_THRESHOLD,
  GST_KAVA_SINGLE_SIDED_THRESHOLD
} from '@/app/utils/constants'
import {
  MarketKey,
  UiSpotMarket,
  InvestmentTypeGst,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

withDefaults(defineProps<{ isDisabled?: boolean }>(), {
  isDisabled: false
})

const spotGridFormValues = useFormValues<SpotGridTradingForm>()
const { lastTradedPrice } = useSpotLastPrice(market)

const marketUsesStableCoins = computed(() =>
  [market.value.baseToken.symbol, market.value.quoteToken.symbol].some(
    (symbol) => SGT_STABLE_COINS.includes(symbol.toLowerCase())
  )
)

const { value: upperPriceValue, errorMessage: upperErrorMessage } =
  useStringField({
    name: SpotGridTradingField.UpperPrice,
    rule: '',
    dynamicRule: computed(() => {
      const lessThanRule = `lessThanSgt:${lastTradedPrice.value.toNumber()}`

      const greaterThanRule = `greaterThanSgt:${
        spotGridFormValues.value[SpotGridTradingField.LowerPrice] || 0
      }`

      const singleSidedRule = `singleSided:@${
        SpotGridTradingField.LowerPrice
      },@${
        SpotGridTradingField.UpperPrice
      },${lastTradedPrice.value.toFixed()},${SpotGridTradingField.UpperPrice},${
        marketUsesStableCoins.value
          ? GST_KAVA_SINGLE_SIDED_THRESHOLD
          : GST_SINGLE_SIDED_THRESHOLD
      }`

      const rules = ['requiredSgt', greaterThanRule, singleSidedRule]

      if (
        spotGridFormValues.value[SpotGridTradingField.IsAssetRebalanceOn] &&
        spotGridFormValues.value[SpotGridTradingField.InvestmentType] ===
          InvestmentTypeGst.Quote
      ) {
        rules.push(lessThanRule)
      }

      return rules.join('|')
    })
  })

const { value: lowerPriceValue, errorMessage: lowerErrorMessage } =
  useStringField({
    name: SpotGridTradingField.LowerPrice,
    rule: '',
    dynamicRule: computed(() => {
      const greaterThanValue =
        spotGridFormValues.value[SpotGridTradingField.IsAssetRebalanceOn] &&
        spotGridFormValues.value[SpotGridTradingField.InvestmentType] ===
          InvestmentTypeGst.Base
          ? lastTradedPrice.value.toNumber()
          : 0

      const greaterThanRule = `greaterThanSgt:${greaterThanValue}`

      const singleSidedRule = `singleSided:@${
        SpotGridTradingField.LowerPrice
      },@${
        SpotGridTradingField.UpperPrice
      },${lastTradedPrice.value.toFixed()},${SpotGridTradingField.LowerPrice},${
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
  <div class="space-y-4 mb-4">
    <p class="field-label">1. {{ $t('sgt.priceRange') }}</p>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <p class="text-2xs text-coolGray-450">{{ $t('sgt.lower') }}</p>
        <AppInputField
          v-model="lowerPriceValue"
          :disabled="isDisabled"
          placeholder="0.00"
        />
        <p v-if="lowerErrorMessage" class="error-message">
          {{ lowerErrorMessage }}
        </p>
      </div>

      <div class="space-y-2">
        <p class="text-2xs text-coolGray-450">{{ $t('sgt.upper') }}</p>
        <AppInputField
          v-model="upperPriceValue"
          :disabled="isDisabled"
          placeholder="0.00"
        />
        <p v-if="upperErrorMessage" class="error-message">
          {{ upperErrorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>
