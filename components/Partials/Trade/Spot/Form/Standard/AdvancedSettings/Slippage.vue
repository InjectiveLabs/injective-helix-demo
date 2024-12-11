<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SpotTradeFormField, SpotMarketCyTags } from '@/types'

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
  <div
    class="flex items-center justify-between"
    :data-cy="dataCyTag(SpotMarketCyTags.AdvancedSettingsSlippage)"
  >
    <AppCheckbox2 v-model="isSlippageOnValue" class="flex text-white">
      Slippage
    </AppCheckbox2>
    <AppInputField
      v-bind="{ decimals: 2, max: 100, min: 0 }"
      v-model="slippageValue"
      no-style
      wrapper-class="border text-xs min-w-0 basis-24 px-2 rounded text-white"
    >
      <template #right>%</template>
    </AppInputField>
  </div>
</template>
