<script setup lang="ts">
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Status, StatusType } from '@injectivelabs/utils'

const button = cva(
  'flex items-center justify-center transition-all rounded-md font-medium font-sans border disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        xs: 'py-1 px-2 text-xs',
        sm: 'py-1 px-3 text-xs',
        md: 'py-2 px-6 text-sm',
        lg: 'py-2 px-8 text-sm'
      },
      variant: {
        primary:
          'bg-blue-500 text-coolGray-975 border-blue-550 hover:bg-blue-500/70 hover:border-blue-550/70 disabled:bg-transparent disabled:text-coolGray-450 disabled:border-blue-550 focus-within:ring-[3px] ring-blue-700',

        'primary-outline':
          'bg-transparent text-coolGray-100 border-blue-550 hover:text-white hover:bg-blue-500/20 disabled:bg-transparent disabled:text-coolGray-450 disabled:border-coolGray-450 focus-within:ring-[3px] ring-blue-700',

        'primary-ghost':
          'bg-transparent text-coolGray-200 border-transparent hover:text-white hover:bg-blue-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-blue-500 focus-within:ring-[3px] ring-blue-700',

        'primary-cta':
          'bg-transparent text-blue-550 border-transparent hover:bg-blue-550 hover:bg-opacity-20',

        danger:
          'bg-red-500 text-red-900 border-red-500 hover:text-red-900 hover:bg-red-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-red-500 focus-within:ring-[3px] ring-red-700',

        'danger-outline':
          'bg-transparent text-coolGray-200 border-red-500 hover:text-white hover:bg-red-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-red-500 focus-within:ring-[3px] ring-red-700',

        'danger-shade':
          'bg-red-500 border-red-500 hover:text-red-900 hover:bg-red-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-red-500 ring-red-700 bg-opacity-20 text-red-500 border-none px-3 focus-within:none',

        'danger-ghost':
          'bg-transparent text-coolGray-200 border-transparent hover:text-white hover:bg-red-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-red-500 focus-within:ring-[3px] ring-red-700',

        'danger-cta':
          'bg-transparent text-red-500 border-transparent hover:bg-red-500 hover:bg-opacity-20 focus-within:ring-0',

        success:
          'bg-green-500 text-green-900 border-green-500 hover:text-green-900 hover:bg-green-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-green-500 focus-within:ring-[3px] ring-green-700',

        'success-outline':
          'bg-transparent text-coolGray-200 border-green-500 hover:text-white hover:bg-green-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-green-500 focus-within:ring-[3px] ring-green-700',

        'success-ghost':
          'bg-transparent text-coolGray-200 border-transparent hover:text-white hover:bg-green-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-green-500 focus-within:ring-[3px] ring-green-700',

        'success-cta':
          'bg-transparent text-green-500 border-transparent hover:bg-green-500 hover:bg-opacity-20 focus-within:ring-0'
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
    status?: Status
    tooltip?: string
    disabled?: boolean
    isLoading?: boolean
    size?: ButtonProps['size']
    variant?: ButtonProps['variant']
    class?: ClassValue | ClassValue[]
  }>(),
  {
    size: 'md',
    tooltip: '',
    class: () => [],
    disabled: false,
    isLoading: false,
    variant: 'primary',
    status: () => new Status(StatusType.Idle)
  }
)
</script>

<template>
  <UTooltip
    :prevent="!tooltip && !$slots.content"
    :ui="{
      base: 'text-sm',
      wrapper: 'relative block',
      width: 'w-fit',
      background: 'dark:bg-black/80'
    }"
    :popper="{ placement: 'top', offsetDistance: 5 }"
  >
    <button
      :class="twMerge(button({ size, variant }), clsx(props.class))"
      :disabled="disabled"
      v-bind="$attrs"
    >
      <span v-if="status.isLoading() || isLoading">&#8202;</span>
      <AppSpinner v-if="status.isLoading() || isLoading" is-sm is-white />

      <slot v-else />
    </button>

    <template #text>
      <slot name="content">
        <span>{{ tooltip }}</span>
      </slot>
    </template>
  </UTooltip>
</template>
