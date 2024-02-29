<script setup lang="ts">
import { OrderbookFormattedRecord } from '@/types/worker'

const props = defineProps({
  isBuy: Boolean,
  isActive: Boolean,

  record: {
    type: Object as PropType<OrderbookFormattedRecord>,
    required: true
  },

  index: {
    type: Number,
    default: -1
  },

  highestVolume: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'set:index': [index: number]
}>()

function setIndex() {
  emit('set:index', props.index)
}
</script>

<template>
  <div
    class="group flex text-xs text-right relative cursor-pointer select-none"
    :class="{ 'bg-brand-800': isActive }"
    @mouseenter="setIndex"
  >
    <div
      class="absolute hidden group-hover:block left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 p-2 rounded-md bg-brand-900 border z-20 text-white"
    >
      <div class="text-xs">
        {{ record.totalVolume }}
      </div>
    </div>

    <div
      class="absolute top-px bottom-px right-px transition-all rounded"
      :class="{
        'bg-red-700/60': isActive && !isBuy,
        'bg-red-500/10': !isActive && !isBuy,
        'bg-green-800/90': isActive && isBuy,
        'bg-green-500/10': !isActive && isBuy
      }"
      :style="{
        width: (Number(record.totalVolume) / Number(highestVolume)) * 100 + '%'
      }"
    />

    <div
      :key="record.price"
      class="flex-1 min-w-0 truncate px-1 relative"
      :class="[isBuy ? 'text-green-500' : 'text-red-500']"
    >
      <!-- {{ priceToString }} -->
      {{ props.record.price }}
    </div>

    <div :key="record.price" class="flex-1 min-w-0 truncate px-1 relative">
      <!-- {{ quantityToString }} -->
      {{ props.record.quantity }}
    </div>

    <div
      :key="record.price + record.quantity"
      class="flex-1 min-w-0 truncate px-1 relative"
    >
      <!-- {{ volumeToString }} -->
      {{ props.record.volume }}
    </div>
  </div>
</template>
