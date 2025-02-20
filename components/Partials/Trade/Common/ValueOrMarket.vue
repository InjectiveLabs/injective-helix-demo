<script setup lang="ts">
withDefaults(
  defineProps<{
    isMarket: boolean
  }>(),
  {}
)
</script>

<template>
  <span v-if="isMarket">{{ $t('trade.market') }}</span>
  <slot v-else></slot>
</template>
