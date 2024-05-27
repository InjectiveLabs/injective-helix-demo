<script setup lang="ts">
import { OrderTypeFilter } from '@/types'

const props = defineProps({
  isDerivative: Boolean,
  isTrigger: Boolean,

  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const options = computed(() => {
  const triggerOptions = [
    { value: OrderTypeFilter.StopLossLimit, display: 'trade.stopLossLimit' },
    { value: OrderTypeFilter.StopLossMarket, display: 'trade.stopLossMarket' },
    {
      value: OrderTypeFilter.TakeProfitLimit,
      display: 'trade.takeProfitLimit'
    },
    {
      value: OrderTypeFilter.TakeProfitMarket,
      display: 'trade.takeProfitMarket'
    }
  ]

  const spotOptions = [
    { value: OrderTypeFilter.Limit, display: 'trade.limit' },
    { value: OrderTypeFilter.Market, display: 'trade.market' }
  ]

  const derivativeOptions = [...spotOptions, ...triggerOptions]

  if (props.isDerivative) {
    return derivativeOptions
  }

  if (props.isTrigger) {
    return triggerOptions
  }

  return spotOptions
})

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})
</script>

<template>
  <AppTabSelect v-model="value" :options="options">
    <template #default>
      <div class="flex items-center max-lg:py-2">
        <span v-if="!value">Filter By Type</span>
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
