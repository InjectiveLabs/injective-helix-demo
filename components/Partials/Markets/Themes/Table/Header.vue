<script setup lang="ts">
// import { MarketHeaderType } from '@/types'

defineProps({
  isAscending: Boolean,

  sortBy: {
    type: String,
    required: true
  }
})

// const emit = defineEmits<{
//   'update:isAscending': [value: boolean]
//   'update:sortBy': [value: MarketHeaderType]
// }>()

// function handleSortBy(value: string) {
//   emit('update:sortBy', value as MarketHeaderType)
// }

// function handleIsAscending(value: boolean) {
//   emit('update:isAscending', value)
// }
</script>

<template>
  <div class="flex p-2 text-xs text-gray-400 border-b border-brand-700">
    <div class="flex-1 p-2">Theme</div>
    <div class="flex-1 p-2">Number Of Markets</div>
    <div class="flex-1 p-2">Total Volume</div>
    <div class="flex-1 p-2">Top Gainers</div>
  </div>
</template>
