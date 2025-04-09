<script setup lang="ts">
import { UiDerivativeMarket } from '@/types'

const { t } = useLang()

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

const getSlQuantityErrorMessage = computed(() => {
  if (!props.market) {
    return ''
  }

  if (props.isSlMarkPriceThresholdError) {
    return t('trade.mark_price_invalid')
  } else if (props.slQuantityErrorMessage) {
    return props.slQuantityErrorMessage
  } else if (props.isSlNotionalLessThanMinNotional) {
    return t('trade.minNotionalError', {
      minNotional: props.market.minNotionalInToken,
      symbol: props.market.quoteToken.symbol
    })
  }

  return ''
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

    <p v-if="getSlQuantityErrorMessage" class="error-message">
      {{ getSlQuantityErrorMessage }}
    </p>
  </div>
</template>
