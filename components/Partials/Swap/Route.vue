<script lang="ts" setup>
withDefaults(
  defineProps<{
    isSm?: boolean
    routeSymbols: string[]
  }>(),
  { isSm: false }
)
</script>

<template>
  <template v-for="(symbol, index) in routeSymbols" :key="symbol">
    <span>{{ symbol }}</span>

    <SharedIcon
      v-if="index !== routeSymbols?.length - 1"
      name="arrow"
      class="rotate-180 w-3 h-3 cursor-text"
      :class="[isSm ? 'w-3 h-3' : 'w-4 h-4']"
    />
  </template>
</template>
