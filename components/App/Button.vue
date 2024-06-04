<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

type Size = 'xs' | 'sm' | 'md' | 'lg'
type Variant =
  | 'primary'
  | 'primary-outline'
  | 'primary-ghost'
  | 'danger'
  | 'danger-outline'
  | 'danger-ghost'
  | 'success'
  | 'success-outline'

const props = defineProps({
  isLoading: Boolean,
  disabled: Boolean,

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
  },

  tooltip: {
    type: String,
    default: ''
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
  <BaseTooltip
    v-bind="{
      disabled: !tooltip
    }"
    :triggers="['hover', 'click']"
  >
    <button
      class="flex items-center justify-center transition-all ring-0"
      :class="[size ? 'btn-' + size : 'btn', 'btn-' + variant, outlineStyle]"
      :disabled="disabled"
      v-bind="$attrs"
    >
      <span v-if="status.isLoading() || isLoading">&#8202;</span>
      <AppSpinner v-if="status.isLoading() || isLoading" is-sm is-white />

      <slot v-else />
    </button>

    <template #content>
      <div class="leading-4" :class="contentClass">
        <slot name="content">
          {{ tooltip }}
        </slot>
      </div>
    </template>
  </BaseTooltip>
</template>

<style>
.tooltip,
.v-popper--theme-tooltip {
  .v-popper__inner {
    @apply bg-gray-900 text-gray-200 border-none max-w-xs text-xs px-3 py-1 shadow-sm;
  }

  .v-popper__arrow-outer,
  .v-popper__arrow-inner {
    @apply border-gray-900;
  }
}
</style>
