<script setup lang="ts">
import { DerivativeGridTradingField, DerivativeGridTradingForm } from '@/types'

const derivativeGridFormValues = useFormValues<DerivativeGridTradingForm>()

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: DerivativeGridTradingField.TakeProfit,
    rule: '',
    dynamicRule: computed(() => {
      const minValueRule = `greaterThanSgt:${
        derivativeGridFormValues.value[DerivativeGridTradingField.UpperPrice]
      }`

      return minValueRule
    })
  })

const { value: stopLossValue, errorMessage: stopLossErrorMessage } =
  useStringField({
    name: DerivativeGridTradingField.StopLoss,
    rule: '',
    dynamicRule: computed(() => {
      const maxValueRule = `lessThanSgt:${
        derivativeGridFormValues.value[DerivativeGridTradingField.LowerPrice]
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
