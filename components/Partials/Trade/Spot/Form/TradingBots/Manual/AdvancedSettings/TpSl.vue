<script setup lang="ts">
import {
  MarketKey,
  SpotGridTradingField,
  SpotGridTradingForm,
  UiSpotMarket
} from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const spotGridFormValues = useFormValues<SpotGridTradingForm>()

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: SpotGridTradingField.TakeProfit,
    rule: '',
    dynamicRule: computed(() => {
      const minValueRule = `greaterThanSgt:${
        spotGridFormValues.value[SpotGridTradingField.UpperPrice]
      }`

      return minValueRule
    })
  })

const { value: stopLossValue, errorMessage: stopLossErrorMessage } =
  useStringField({
    name: SpotGridTradingField.StopLoss,
    rule: '',
    dynamicRule: computed(() => {
      const maxValueRule = `lessThanSgt:${
        spotGridFormValues.value[SpotGridTradingField.LowerPrice]
      }`

      return maxValueRule
    })
  })

const { value: buyBaseOnTakeProfitValue } = useBooleanField({
  name: SpotGridTradingField.BuyBaseOnTakeProfit,
  initialValue: false,
  rule: ''
})

const { value: sellBaseOnStopLossValue } = useBooleanField({
  name: SpotGridTradingField.SellBaseOnStopLoss,
  initialValue: false,
  rule: ''
})
</script>

<template>
  <div class="p-1 space-y-4">
    <AppInputField
      v-model="takeProfitValue"
      :placeholder="$t('trade.takeProfit')"
      class="placeholder:font-sans"
    />
    <p v-if="takeProfitErrorMessage" class="error-message">
      {{ takeProfitErrorMessage }}
    </p>

    <div class="!mt-2 !-mb-2">
      <AppCheckbox2
        v-model="buyBaseOnTakeProfitValue"
        class="!mt-2 !-mb-2 text-coolGray-450 font-medium"
      >
        {{ $t('sgt.buySymbolOnStop', { symbol: market.baseToken.symbol }) }}
      </AppCheckbox2>
    </div>

    <AppInputField
      v-model="stopLossValue"
      :placeholder="$t('trade.stopLoss')"
      class="placeholder:font-sans"
    />

    <p v-if="stopLossErrorMessage" class="error-message">
      {{ stopLossErrorMessage }}
    </p>

    <div class="!mt-2 !-mb-2 text-coolGray-450 font-medium">
      <AppCheckbox2 v-model="sellBaseOnStopLossValue">
        {{ $t('sgt.sellAllSymbolOnStop', { symbol: market.baseToken.symbol }) }}
      </AppCheckbox2>
    </div>
  </div>
</template>
