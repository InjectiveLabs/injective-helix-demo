<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { value: isSlippageOnValue } = useBooleanField({
  name: DerivativesTradeFormField.IsSlippageOn,
  initialValue: true,
  rule: ''
})
const { value: slippageValue } = useStringField({
  name: DerivativesTradeFormField.Slippage,
  initialValue: '0.5',
  rule: ''
})
</script>

<template>
  <div class="flex items-center justify-between">
    <AppCheckbox2 v-model="isSlippageOnValue">Slippage</AppCheckbox2>
    <AppInputField
      v-bind="{ decimals: 2, max: 100, min: 0 }"
      v-model="slippageValue"
      no-style
      wrapper-class="border text-xs min-w-0 basis-24 px-2 rounded mb-1"
    >
      <template #right>%</template>
    </AppInputField>
  </div>
</template>
