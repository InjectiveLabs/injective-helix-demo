<script lang="ts" setup>
const props = defineProps({
  isXs: Boolean,
  isSm: Boolean,
  isMd: Boolean,
  isLg: Boolean,
  isXl: Boolean,
  isWhite: Boolean
})

const sizeClasses = computed(() => {
  if (props.isXs) {
    return 'h-2 w-2 border-[2px]'
  }

  if (props.isSm) {
    return 'h-4 w-4 border-[3px]'
  }

  if (props.isLg) {
    return 'h-8 w-8 border-[4px]'
  }

  if (props.isXl) {
    return 'h-12 w-12 border-[6px]'
  }

  return 'h-6 w-6 border-[4px]'
})
</script>

<template>
  <BaseSpinner
    class="m-0"
    :class="[
      sizeClasses,
      isWhite
        ? 'border-t-gray-200 border-r-gray-200'
        : 'border-t-blue-500 border-r-blue-500'
    ]"
  />
</template>
