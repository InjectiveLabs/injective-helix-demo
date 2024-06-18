<script setup lang="ts">
import { SpotGridTradingField, SpotGridTradingForm } from '@/types'

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

    <AppInputField
      v-model="stopLossValue"
      :placeholder="$t('trade.stopLoss')"
      class="placeholder:font-sans"
    />

    <p v-if="stopLossErrorMessage" class="error-message">
      {{ stopLossErrorMessage }}
    </p>
  </div>
</template>
