<script lang="ts" setup>
defineProps({
  isRound: Boolean,
  isEmpty: Boolean
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
