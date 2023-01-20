<script lang="ts" setup>
const props = defineProps({
  lg: Boolean,
  md: Boolean,
  noPadding: Boolean,
  noTopBorderRadius: Boolean,
  tight: Boolean,

  bgColor: {
    type: String,
    default: 'bg-gray-900'
  }
})

const borderRadiusClass = computed(() => {
  if (props.noTopBorderRadius) {
    return 'rounded-b-xl'
  }

  return 'rounded-xl'
})

const padding = computed(() => {
  if (props.noPadding) {
    return 'p-0'
  }

  return {
    'p-4 lg:p-6': props.lg && !props.tight,
    'p-4': props.md && !props.tight,
    'p-2 lg:p-3': !props.md && !props.lg && !props.tight
  }
})
</script>

<template>
  <div :class="[borderRadiusClass, bgColor, padding]">
    <slot />
  </div>
</template>
