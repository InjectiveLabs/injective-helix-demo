<script setup lang="ts">
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { ClassValue, clsx } from 'clsx'
import { Status, StatusType } from '@injectivelabs/utils'
import { computed, useSlots } from 'vue'

const button = cva(
  'flex items-center justify-center transition-all rounded-md font-semibold font-sans border disabled:cursor-not-allowed',
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
          'bg-blue-500 text-blue-900 border-blue-500 hover:bg-blue-500/70 hover:border-blue-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-blue-500 focus-within:ring-[3px] ring-blue-700',

        'primary-outline':
          'bg-transparent text-coolGray-200 border-blue-500 hover:text-white hover:bg-blue-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-coolGray-500 focus-within:ring-[3px] ring-blue-700',

        'primary-ghost':
          'bg-transparent text-coolGray-200 border-transparent hover:text-white hover:bg-blue-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-blue-500 focus-within:ring-[3px] ring-blue-700',

        danger:
          'bg-red-500 text-red-900 border-red-500 hover:text-red-900 hover:bg-red-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-red-500 focus-within:ring-[3px] ring-red-700',

        'danger-outline':
          'bg-transparent text-coolGray-200 border-red-500 hover:text-white hover:bg-red-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-red-500 focus-within:ring-[3px] ring-red-700',

        'danger-ghost':
          'bg-transparent text-coolGray-200 border-transparent hover:text-white hover:bg-red-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-red-500 focus-within:ring-[3px] ring-red-700',

        success:
          'bg-green-500 text-green-900 border-green-500 hover:text-green-900 hover:bg-green-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-green-500 focus-within:ring-[3px] ring-green-700',

        'success-outline':
          'bg-transparent text-coolGray-200 border-green-500 hover:text-white hover:bg-green-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-green-500 focus-within:ring-[3px] ring-green-700',

        'success-ghost':
          'bg-transparent text-coolGray-200 border-transparent hover:text-white hover:bg-green-500/20 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-green-500 focus-within:ring-[3px] ring-green-700'
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
    class?: ClassValue | ClassValue[]
    status?: Status
    variant?: ButtonProps['variant']
    tooltip?: string
    disabled?: boolean
    isLoading?: boolean
  }>(),
  {
    size: 'md',
    class: () => [],
    status: () => new Status(StatusType.Idle),
    variant: 'primary',
    tooltip: '',
    disabled: false,
    isLoading: false
  }
)

const slots = useSlots()
const formattedSlotContent = computed(() => {
  const slotContent = slots.default?.()[0]?.children || 'default'
  return slotContent.toString().trim().replace(/\s+/g, '-').toLowerCase()
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
      :class="twMerge(button({ size, variant }), clsx(props.class))"
      :disabled="disabled"
      v-bind="$attrs"
      :data-cy="dataCyTag(`button-${formattedSlotContent}`)"
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
