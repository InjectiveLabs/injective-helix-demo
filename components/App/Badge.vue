<script lang="ts" setup>
const props = defineProps({
  sm: Boolean,
  xs: Boolean,
  md: Boolean,
  lg: Boolean,
  blue: Boolean,
  green: Boolean,
  red: Boolean,
  gray: Boolean
})

const classes = computed(() => {
  const result = [
    'rounded',
    'cursor-default',
    'font-bold',
    'inline-flex',
    'leading-normal',
    'outline-none',
    'overflow-hidden',
    'text-decoration-none',
    'items-center',
    'shadow'
  ]

  if (props.lg) {
    result.push('text-sm', 'px-4', 'py-1')
  } else if (props.md) {
    result.push('text-sm', 'px-3', 'py-px')
  } else if (props.sm) {
    result.push('text-xs', 'px-3', 'py-px')
  } else if (props.xs) {
    result.push('text-2xs', 'px-2', 'py-px')
  }

  if (props.blue) {
    result.push('bg-blue-500', 'text-blue-900')
  } else if (props.red) {
    result.push('bg-red-500', 'text-red-900')
  } else if (props.gray) {
    result.push('bg-gray-700', 'text-gray-200')
  } else if (props.green) {
    result.push('bg-green-500', 'text-green-900')
  }

  return result.join(' ')
})
</script>

<template>
  <span :class="classes" class="badge capitalize">
    <slot></slot>
  </span>
</template>
