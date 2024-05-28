<script lang="ts" setup>
const props = defineProps({
  isLg: Boolean,
  isMd: Boolean,
  isTight: Boolean,
  isNoPadding: Boolean,
  isNoTopBorderRadius: Boolean,

  bgColor: {
    type: String,
    default: 'bg-brand-800'
  }
})

const borderRadiusClass = computed(() => {
  if (props.isNoTopBorderRadius) {
    return 'rounded-b-xl'
  }

  return 'rounded-xl'
})

const padding = computed(() => {
  if (props.isNoPadding) {
    return 'p-0'
  }

  return {
    'p-4 lg:p-6': props.isLg && !props.isTight,
    'p-4': props.isMd && !props.isTight,
    'p-2 lg:p-3': !props.isMd && !props.isLg && !props.isTight
  }
})
</script>

<template>
  <div :class="[borderRadiusClass, bgColor, padding]">
    <slot />
  </div>
</template>
