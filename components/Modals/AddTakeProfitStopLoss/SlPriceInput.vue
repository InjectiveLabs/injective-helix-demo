<script setup lang="ts">
import { UiDerivativeMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    isSlDisabled: boolean
    market: UiDerivativeMarket
    stopLossErrorMessage?: string
  }>(),
  { modelValue: '', stopLossErrorMessage: '' }
)

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

const stopLossValue = computed({
  get: (): string | undefined => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <div class="flex flex-col flex-1 gap-2">
    <h5 class="font-semibold text-xs">
      {{ $t('trade.stopLossTriggerPrice') }}
    </h5>
    <AppInputField
      v-if="!isSlDisabled"
      v-model="stopLossValue"
      v-bind="{
        noStyle: true,
        alignLeft: true,
        placeholder: '0.00',
        decimals: market.priceDecimals,
        inputClasses:
          'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
      }"
    />

    <p v-if="stopLossErrorMessage" class="error-message">
      {{ stopLossErrorMessage }}
    </p>
  </div>
</template>
