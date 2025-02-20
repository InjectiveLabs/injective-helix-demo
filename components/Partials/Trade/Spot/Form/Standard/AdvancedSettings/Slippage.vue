<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import {
  SpotMarketCyTags,
  SpotTradeFormField,
  DerivativesTradeForm
} from '@/types'

const errors = useFormErrors<DerivativesTradeForm>()

const { value: isSlippageOnValue } = useBooleanField({
  name: SpotTradeFormField.IsSlippageOn,
  initialValue: true,
  rule: ''
})

const { value: slippageValue } = useStringField({
  name: SpotTradeFormField.Slippage,
  initialValue: '0.5',
  rule: '',
  dynamicRule: computed(() => {
    return isSlippageOnValue.value ? 'required' : ''
  })
})
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between"
      :data-cy="dataCyTag(SpotMarketCyTags.AdvancedSettingsSlippage)"
    >
      <AppCheckbox2 v-model="isSlippageOnValue" class="flex text-white">
        {{ $t('trade.slippage') }}
      </AppCheckbox2>
      <AppInputField
        v-bind="{ decimals: 2, max: 100, min: 0 }"
        v-model="slippageValue"
        no-style
        :disabled="!isSlippageOnValue"
        wrapper-class="border text-xs min-w-0 basis-24 px-2 rounded text-white"
      >
        <template #right>%</template>
      </AppInputField>
    </div>

    <p v-if="errors?.slippage" class="text-orange-500 text-xs mt-1">
      {{ errors.slippage }}
    </p>
    <p v-if="!isSlippageOnValue" class="text-orange-500 text-xs mt-1">
      {{ $t('trade.slippageOffNote') }}
    </p>
  </div>
</template>
