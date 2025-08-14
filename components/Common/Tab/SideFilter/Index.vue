<script setup lang="ts">
import { TradeDirection } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    modelValue: string
    wrapperClass?: string
  }>(),
  {
    isSpot: false,
    modelValue: '',
    wrapperClass: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const options = computed(() =>
  props.isSpot
    ? [
        { value: TradeDirection.Sell, display: 'trade.sell' },
        { value: TradeDirection.Buy, display: 'trade.buy' }
      ]
    : [
        { value: TradeDirection.Short, display: 'trade.short' },
        { value: TradeDirection.Long, display: 'trade.long' }
      ]
)

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})
</script>

<template>
  <AppTabSelect
    v-model="value"
    :wrapper-class="wrapperClass"
    :options="options"
  >
    <template #default>
      <div class="flex items-center max-lg:py-2">
        <span v-if="!value">{{ $t('portfolio.filters.bySide') }}</span>
        <span v-else>{{ $t(`trade.${value}`) }}</span>
      </div>
    </template>

    <template #option="{ option }">
      <div class="px-4">
        {{ $t(option.display) }}
      </div>
    </template>
  </AppTabSelect>
</template>
