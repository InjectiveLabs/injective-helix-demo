<script setup lang="ts">
import { UiDerivativeMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    market: UiDerivativeMarket
    tpQuantityErrorMessage?: string
    isTpMarkPriceThresholdError?: boolean
    isTpNotionalLessThanMinNotional?: boolean
  }>(),
  { modelValue: '', tpQuantityErrorMessage: '' }
)

const emit = defineEmits<{
  'update:modelValue': [state: string]
  'option:update': [percentage: number]
}>()

const tpQuantity = computed({
  get: (): string | undefined => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

function onOptionUpdate(percentage: number) {
  emit('option:update', percentage)
}
</script>

<template>
  <div class="flex flex-col flex-1 gap-2">
    <h5 class="font-semibold text-xs">
      {{ $t('trade.takeProfitQuantity') }}
    </h5>

    <div class="relative">
      <AppInputField
        v-model="tpQuantity"
        v-bind="{
          noStyle: true,
          alignLeft: true,
          placeholder: '0.00',
          decimals: market.priceDecimals,
          inputClasses:
            'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
        }"
      />

      <div
        class="flex gap-4 absolute right-3 top-1/2 -translate-y-1/2 bg-brand-875 p-1 text-sm"
      >
        <ModalsPartialClosePositionOption
          v-bind="{ label: $t('common.max'), value: 100 }"
          @option:update="onOptionUpdate"
        />
      </div>
    </div>

    <p
      v-if="isTpMarkPriceThresholdError"
      class="error-message first-letter:capitalize"
    >
      {{ $t('trade.mark_price_invalid') }}
    </p>

    <p
      v-else-if="tpQuantityErrorMessage"
      class="error-message first-letter:capitalize"
    >
      {{ tpQuantityErrorMessage }}
    </p>

    <p
      v-else-if="isTpNotionalLessThanMinNotional"
      class="error-message first-letter:capitalize"
    >
      {{
        $t('trade.minNotionalError', {
          symbol: market.quoteToken.symbol,
          minNotional: market.minNotionalInToken
        })
      }}
    </p>
  </div>
</template>
