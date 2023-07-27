<script lang="ts" setup>
const attrs = useAttrs()

const props = defineProps({
  xs: Boolean,
  sm: Boolean,
  lg: Boolean,
  xl: Boolean,
  disabled: Boolean,
  isLoading: Boolean
})

const emit = defineEmits<{
  click: []
}>()

const classes = computed(() => {
  if (props.xs) {
    return 'text-xs leading-4 px-2 h-6'
  }

  if (props.sm) {
    return 'text-xs leading-4 px-6 h-8'
  }

  if (props.lg) {
    return 'text-base leading-5 px-6 h-10'
  }

  if (props.xl) {
    return 'text-base leading-5 px-4 h-12'
  }

  // md
  return 'text-sm px-6 leading-4 h-9'
})

const filteredAttrs = computed(() => {
  const filteredAttrs = { ...attrs }

  /** Remove text|bg color from buttons when they are disabled */
  if (props.disabled) {
    const filteredClass = (filteredAttrs.class as string)
      .replace(/text-(\w+)-(\d+)/g, '')
      .replace(/bg-(\w+)-(\d+)/g, '')

    return { ...attrs, class: filteredClass }
  }

  return filteredAttrs
})

const hasBackground = computed(() => {
  if (!attrs.class) {
    return false
  }

  const classes = attrs.class as string

  return classes.includes('bg-')
})

function handleClick() {
  if (props.isLoading) {
    return
  }

  emit('click')
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <button
    :disabled="disabled"
    type="button"
    role="button"
    :class="[
      classes,
      {
        'border-transparent': hasBackground && !disabled,
        ' border-gray-600 bg-transparent text-gray-600 cursor-not-allowed':
          disabled,
        'hover:bg-opacity-80 hover:text-opacity-80 hover:border-opacity-80':
          !disabled
      }
    ]"
    v-bind="filteredAttrs"
    class="font-bold rounded-md border box-border focus:outline-none"
    @click="handleClick"
  >
    <slot v-if="!isLoading" />
    <span v-else class="flex items-center justify-center">
      <AppSpinner sm white />
    </span>
  </button>
</template>
