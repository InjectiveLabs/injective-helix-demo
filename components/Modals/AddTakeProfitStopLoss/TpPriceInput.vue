<script setup lang="ts">
import { UiDerivativeMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    isTpDisabled: boolean
    market: UiDerivativeMarket
    takeProfitErrorMessage?: string
  }>(),
  { modelValue: '', takeProfitErrorMessage: '' }
)

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

const takeProfitValue = computed({
  get: (): string | undefined => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <div class="flex flex-col flex-1 gap-2">
    <h5 class="font-semibold text-xs">
      {{ $t('trade.takeProfitTriggerPrice') }}
    </h5>

    <AppInputField
      v-if="!isTpDisabled"
      v-model="takeProfitValue"
      v-bind="{
        noStyle: true,
        alignLeft: true,
        placeholder: '0.00',
        decimals: market.priceDecimals,
        inputClasses:
          'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
      }"
    />

    <p v-if="takeProfitErrorMessage" class="error-message">
      {{ takeProfitErrorMessage }}
    </p>
  </div>
</template>
