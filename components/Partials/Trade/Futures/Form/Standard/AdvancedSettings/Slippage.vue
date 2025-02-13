<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { errors } = useForm()

const { value: isSlippageOnValue } = useBooleanField({
  name: DerivativesTradeFormField.IsSlippageOn,
  initialValue: true,
  rule: ''
})
const { value: slippageValue } = useStringField({
  name: DerivativesTradeFormField.Slippage,
  initialValue: '0.5',
  rule: 'slippage'
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <AppCheckbox2 v-model="isSlippageOnValue" class="text-white">
        {{ $t('trade.slippage') }}
      </AppCheckbox2>
      <AppInputField
        v-bind="{ decimals: 2, max: 50, min: 0 }"
        v-model="slippageValue"
        no-style
        wrapper-class="border text-xs min-w-0 basis-24 px-2 rounded mb-1 text-white"
      >
        <template #right>%</template>
      </AppInputField>
    </div>

    <p v-if="errors?.slippage" class="text-orange-500 text-xs mt-1">
      {{ errors.slippage }}
    </p>
  </div>
</template>
