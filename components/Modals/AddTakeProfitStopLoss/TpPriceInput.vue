<script setup lang="ts">
import { PerpetualMarketCyTags } from '@/types';
import type { UiDerivativeMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
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
      v-model="takeProfitValue"
      v-bind="{
        noStyle: true,
        alignLeft: true,
        placeholder: '0.00',
        decimals: market.priceDecimals,
        inputClasses:
          'placeholder-coolGray-450 text-sm p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
      }"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlEditFormTakeProfitTriggerPrice)"
    />

    <p
      v-if="takeProfitErrorMessage"
      class="error-message"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlFormTakeProfitErrorMessage)"
    >
      {{ takeProfitErrorMessage }}
    </p>
  </div>
</template>
