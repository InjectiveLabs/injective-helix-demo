<script lang="ts" setup>
withDefaults(
  defineProps<{
    amount: string | number
    shouldTruncate?: boolean
    maxTrailingZeros?: number
  }>(),
  {
    shouldTruncate: false,
    maxTrailingZeros: 3
  }
)
</script>

<template>
  <SharedUsdAmount
    v-bind="{
      ...$attrs,
      shouldTruncate,
      maxTrailingZeros,
      amount: amount.toString()
    }"
  />
</template>
