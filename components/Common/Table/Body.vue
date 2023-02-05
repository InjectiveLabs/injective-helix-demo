<script lang="ts" setup>
defineProps({
  round: Boolean,
  showEmpty: Boolean
})
</script>

<template>
  <div
    class="grid grid-cols-1"
    :class="{
      'rounded-lg overflow-hidden': round,
      'h-full': showEmpty
    }"
  >
    <slot />

    <div
      v-if="showEmpty"
      class="col-span-1 px-6 text-sm py-4 text-gray-200 items-center rounded"
    >
      <slot name="empty" />
    </div>
  </div>
</template>
