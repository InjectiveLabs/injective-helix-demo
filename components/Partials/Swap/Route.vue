<script lang="ts" setup>
defineProps({
  routeSymbols: {
    type: Array as PropType<string[]>,
    required: true
  }
})
</script>

<template>
  <template v-for="(symbol, index) in routeSymbols" :key="symbol">
    <span>{{ symbol }}</span>

    <BaseIcon
      v-if="index !== routeSymbols?.length - 1"
      name="arrow"
      class="rotate-180 w-4 h-4 cursor-text"
    />
  </template>
</template>
