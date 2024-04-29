<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { value: isSlippageOnValue } = useBooleanField({
  name: DerivativesTradeFormField.IsSlippageOn,
  initialValue: true
})
const { value: slippageValue } = useStringField({
  name: DerivativesTradeFormField.Slippage,
  initialValue: '0.5'
})
</script>

<template>
  <div class="flex items-center justify-between">
    <AppCheckbox v-model="isSlippageOnValue">Slippage</AppCheckbox>
    <AppInputField
      v-bind="{ decimals: 2, max: 100, min: 0 }"
      v-model="slippageValue"
      no-style
      wrapper-class="border text-xs min-w-0 basis-24 px-2 rounded"
    >
      <template #right>%</template>
    </AppInputField>
  </div>
</template>
