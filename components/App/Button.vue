<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

type Size = 'xs' | 'sm' | 'md' | 'lg'
type Variant =
  | 'primary'
  | 'primary-outline'
  | 'danger'
  | 'danger-outline'
  | 'danger-ghost'
  | 'success'
  | 'success-outline'

const props = defineProps({
  isLoading: Boolean,

  size: {
    type: String as PropType<Size>,
    default: ''
  },

  variant: {
    type: String as PropType<Variant>,
    default: 'primary'
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})

const outlineStyle = computed(() => {
  if (['danger', 'danger-outline', 'danger-ghost'].includes(props.variant)) {
    return 'focus-within:ring-[3px] ring-red-700'
  }

  if (['success', 'success-outline', 'success-ghost'].includes(props.variant)) {
    return 'focus-within:ring-[3px] ring-green-700'
  }

  return 'focus-within:ring-[3px] ring-blue-700'
})
</script>

<template>
  <button
    class="flex items-center justify-center transition-all ring-0"
    :class="[size ? 'btn-' + size : 'btn', 'btn-' + variant, outlineStyle]"
    v-bind="$attrs"
  >
    <span v-if="status.isLoading() || isLoading">&#8202;</span>
    <AppSpinner v-if="status.isLoading() || isLoading" is-sm is-white />

    <slot v-else />
  </button>
</template>
