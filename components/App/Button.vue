<script setup lang="ts">
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { Status, StatusType } from '@injectivelabs/utils'

const button = cva(
  'flex items-center justify-center transition-all rounded-md',
  {
    variants: {
      size: {
        xs: 'btn-xs',
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg'
      },
      variant: {
        primary: 'btn-primary focus-within:ring-[3px] ring-blue-700',
        'primary-outline':
          'btn-primary-outline focus-within:ring-[3px] ring-blue-700',
        'primary-ghost':
          'btn-primary-ghost focus-within:ring-[3px] ring-blue-700',
        danger: 'btn-danger focus-within:ring-[3px] ring-red-700',
        'danger-outline':
          'btn-danger-outline focus-within:ring-[3px] ring-red-700',
        'danger-ghost': 'btn-danger-ghost focus-within:ring-[3px] ring-red-700',
        success: 'btn-success focus-within:ring-[3px] ring-green-700',
        'success-outline':
          'btn-success-outline focus-within:ring-[3px] ring-green-700',
        'success-ghost':
          'btn-success-ghost focus-within:ring-[3px] ring-green-700'
      }
    }
  }
)

export type ButtonProps = VariantProps<typeof button>

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    size?: ButtonProps['size']
    class?: string
    status?: Status
    variant?: ButtonProps['variant']
    tooltip?: string
    disabled?: boolean
    isLoading?: boolean
  }>(),
  {
    size: 'md',
    class: '',
    status: () => new Status(StatusType.Idle),
    variant: 'primary',
    tooltip: '',
    disabled: false,
    isLoading: false
  }
)
</script>

<template>
  <SharedTooltip
    v-bind="{
      disabled: !tooltip
    }"
    :triggers="['hover', 'click']"
  >
    <button
      :class="twMerge(button({ size, variant }), props.class)"
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
