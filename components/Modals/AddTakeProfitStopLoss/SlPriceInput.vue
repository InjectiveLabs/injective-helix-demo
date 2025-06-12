<script setup lang="ts">
import { PerpetualMarketCyTags } from '@/types';
import type { UiDerivativeMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
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
      v-model="stopLossValue"
      v-bind="{
        noStyle: true,
        alignLeft: true,
        placeholder: '0.00',
        decimals: market.priceDecimals,
        inputClasses:
          'placeholder-coolGray-450 text-sm p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
      }"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlFormStopLossTriggerPrice)"
    />

    <p 
      v-if="stopLossErrorMessage"
      class="error-message"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlFormStopLossErrorMessage)"
    >
      {{ stopLossErrorMessage }}
    </p>
  </div>
</template>
