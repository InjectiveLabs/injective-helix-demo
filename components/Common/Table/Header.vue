<script lang="ts" setup>
const props = defineProps({
  isLg: Boolean,

  classes: {
    type: String,
    default: 'md:grid hidden'
  }
})

const sizeClasses = computed(() => {
  const result = []

  if (props.isLg) {
    result.push('py-2', 'px-6', 'text-2xs', '2xl:text-xs')
  } else {
    result.push('px-3', 'py-4', 'text-2xs', '2xl:text-xs')
  }

  return result.join(' ')
})
</script>

<template>
  <div
    class="grid-cols-12 gap-4 text-gray-200 uppercase items-center"
    :class="[classes, sizeClasses]"
  >
    <slot />
  </div>
</template>
