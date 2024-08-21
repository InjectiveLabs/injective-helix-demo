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

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    size?: Size
    status?: Status
    variant?: Variant
    tooltip?: string
    disabled?: boolean
    isLoading?: boolean
  }>(),
  {
    size: 'md',
    variant: 'primary',
    status: () => new Status(StatusType.Idle),
    tooltip: '',
    disabled: false,
    isLoading: false
  }
)

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
  <SharedTooltip
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
      <slot name="content">
        <span>{{ tooltip }}</span>
      </slot>
    </template>
  </SharedTooltip>
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
