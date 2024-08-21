<script setup lang="ts">
withDefaults(
  defineProps<{
    isAscending?: boolean
    sortBy: string
  }>(),
  {
    isAscending: false
  }
)

const { t } = useLang()

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
    <div class="flex-1 p-2">{{ t('markets.theme') }}</div>
    <div class="flex-1 p-2">{{ t('markets.numberOfMarkets') }}</div>
    <div class="flex-1 p-2">{{ t('markets.totalVolume') }}</div>
    <div class="flex-1 p-2">{{ t('markets.topGainers') }}</div>
  </div>
</template>
