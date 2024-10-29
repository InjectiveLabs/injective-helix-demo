<script lang="ts" setup>
withDefaults(
  defineProps<{
    amount: string | number
    shouldTruncate?: boolean
    maxTrailingZeros?: number
  }>(),
  {
    shouldTruncate: true,
    maxTrailingZeros: 3
  }
)
</script>

<template>
  <SharedAmountCollapsed
    v-bind="{
      shouldTruncate,
      maxTrailingZeros,
      amount: amount.toString()
    }"
  />
</template>
