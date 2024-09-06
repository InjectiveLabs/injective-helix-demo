<script lang="ts" setup>
withDefaults(defineProps<{ isRound?: boolean; isEmpty?: boolean }>(), {
  isRound: false,
  isEmpty: false
})
</script>

<template>
  <div
    class="grid grid-cols-1"
    :class="{
      'rounded-lg overflow-hidden': isRound,
      'h-full': isEmpty
    }"
  >
    <slot />

    <div
      v-if="isEmpty"
      class="col-span-1 px-6 text-sm py-4 text-gray-200 items-center rounded"
    >
      <slot name="empty" />
    </div>
  </div>
</template>
