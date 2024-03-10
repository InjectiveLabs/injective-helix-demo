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

defineProps({
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
</script>

<template>
  <button
    class="flex items-center justify-center focus-ring transition-all"
    :class="[size ? 'btn-' + size : 'btn', 'btn-' + variant]"
    v-bind="$attrs"
  >
    <span v-if="status.isLoading()">&#8202;</span>
    <AppSpinner v-if="status.isLoading()" is-sm is-white />

    <slot v-else />
  </button>
</template>
