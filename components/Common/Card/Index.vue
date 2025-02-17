<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    isLg?: boolean
    isMd?: boolean
    isTight?: boolean
    bgColor?: string
    isNoPadding?: boolean
    isNoTopBorderRadius?: boolean
  }>(),
  {
    isLg: false,
    isMd: false,
    isTight: false,
    bgColor: 'bg-brand-800',
    isNoPadding: false,
    isNoTopBorderRadius: false
  }
)

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
