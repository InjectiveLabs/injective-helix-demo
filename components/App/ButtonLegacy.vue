<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

const attrs = useAttrs()

const props = defineProps({
  isXs: Boolean,
  isSm: Boolean,
  isLg: Boolean,
  isXl: Boolean,
  isDisabled: Boolean,
  isLoading: Boolean,
  isDarkSpinner: Boolean,

  status: {
    type: Object as PropType<Status | undefined>,
    default: undefined
  }
})

const emit = defineEmits<{
  click: []
}>()

const classes = computed(() => {
  if (props.isXs) {
    return 'text-xs leading-4 px-2 h-6'
  }

  if (props.isSm) {
    return 'text-xs leading-4 px-6 h-8'
  }

  if (props.isLg) {
    return 'text-base leading-5 px-6 h-10'
  }

  if (props.isXl) {
    return 'text-base leading-5 px-4 h-12'
  }

  // md
  return 'text-sm px-6 leading-4 h-9'
})

const filteredAttrs = computed(() => {
  const filteredAttrs = { ...attrs }

  /** Remove text|bg color from buttons when they are isDisabled */
  if (props.isDisabled) {
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

function click() {
  if (props.isLoading || props.status?.isLoading()) {
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
    :disabled="isDisabled"
    type="button"
    role="button"
    :class="[
      classes,
      {
        'border-transparent': hasBackground && !isDisabled,
        ' border-gray-600 bg-transparent text-gray-600 cursor-not-allowed':
          isDisabled,
        'hover:bg-opacity-80 hover:text-opacity-80 hover:border-opacity-80':
          !isDisabled
      }
    ]"
    v-bind="filteredAttrs"
    class="font-semibold rounded-md border box-border focus:outline-none"
    @click="click"
  >
    <slot v-if="(!status || status.isNotLoading()) && !isLoading" />
    <span v-else class="flex items-center justify-center">
      <AppSpinner v-bind="{ isSm: true, isWhite: !isDarkSpinner }" />
    </span>
  </button>
</template>
