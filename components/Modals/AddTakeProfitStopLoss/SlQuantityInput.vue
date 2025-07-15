<script setup lang="ts">
import { PerpetualMarketCyTags } from '@/types'
import type { UiDerivativeMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    market: UiDerivativeMarket
    slQuantityErrorMessage?: string
    isSlMarkPriceThresholdError?: boolean
    isSlNotionalLessThanMinNotional?: boolean
  }>(),
  { modelValue: '', slQuantityErrorMessage: '' }
)

const emit = defineEmits<{
  'update:modelValue': [state: string]
  'option:update': [percentage: number]
}>()

const slQuantity = computed({
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
      {{ $t('trade.stopLossQuantity') }}
    </h5>

    <div class="relative text-sm">
      <AppInputField
        v-model="slQuantity"
        v-bind="{
          noStyle: true,
          alignLeft: true,
          placeholder: '0.00',
          decimals: market.quantityDecimals,
          inputClasses:
            'placeholder-coolGray-450 text-sm p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
        }"
        :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlFormStopLossQuantity)"
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
      v-if="isSlMarkPriceThresholdError"
      class="error-message first-letter:capitalize"
    >
      {{ $t('trade.markPriceInvalid') }}
    </p>

    <p
      v-else-if="slQuantityErrorMessage"
      class="error-message first-letter:capitalize"
      :data-cy="
        dataCyTag(PerpetualMarketCyTags.TpSlFormStopLossQtyErrorMessage)
      "
    >
      {{ slQuantityErrorMessage }}
    </p>

    <p
      v-else-if="isSlNotionalLessThanMinNotional"
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
