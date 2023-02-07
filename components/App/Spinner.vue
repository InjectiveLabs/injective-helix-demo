<script lang="ts" setup>
const props = defineProps({
  sm: Boolean,
  md: Boolean,
  lg: Boolean,
  xl: Boolean,
  white: Boolean
})

const sizeClasses = computed(() => {
  if (props.sm) {
    return 'h-4 w-4 border-[3px]'
  }

  if (props.lg) {
    return 'h-8 w-8 border-[4px]'
  }

  if (props.xl) {
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
      white
        ? 'border-t-gray-200 border-r-gray-200'
        : 'border-t-blue-500 border-r-blue-500'
    ]"
  />
</template>
