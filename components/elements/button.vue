<template>
  <button
    type="button"
    role="button"
    :class="classes"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot v-if="status && status.isNotLoading()" />
    <span v-if="status && status.isLoading()" class="block w-full">
      <span class="spinner" />
    </span>
  </button>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    status: {
      required: false,
      type: Object as PropType<Status>,
      default: () => new Status()
    },

    sm: {
      required: false,
      default: false,
      type: Boolean
    },

    default: {
      required: false,
      default: false,
      type: Boolean
    },

    md: {
      required: false,
      default: false,
      type: Boolean
    },

    lg: {
      required: false,
      default: false,
      type: Boolean
    },

    xl: {
      default: false,
      type: Boolean
    },

    text: {
      required: false,
      default: false,
      type: Boolean
    },

    outline: {
      required: false,
      default: false,
      type: Boolean
    },

    redOutline: {
      required: false,
      default: false,
      type: Boolean
    },

    textLg: {
      required: false,
      default: false,
      type: Boolean
    },

    textXs: {
      required: false,
      default: false,
      type: Boolean
    },

    textSm: {
      required: false,
      default: false,
      type: Boolean
    },

    primary: {
      required: false,
      default: false,
      type: Boolean
    },

    aqua: {
      required: false,
      default: false,
      type: Boolean
    },

    red: {
      required: false,
      default: false,
      type: Boolean
    },

    gray: {
      required: false,
      default: false,
      type: Boolean
    },

    light: {
      default: false,
      type: Boolean
    },

    disabled: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    classes() {
      const classes = ['text-center', 'rounded-3xl', 'focus:outline-none']

      if (this.disabled) {
        classes.push('pointer-events-none', 'text-gray-600')

        if (!this.text) {
          classes.push('border', 'border-gray-700')
        }
      }

      if (this.sm) {
        classes.push('px-2', 'py-1', 'text-xs')
      } else if (this.md) {
        classes.push('px-4', 'py-2', 'text-sm')
      } else if (this.lg) {
        classes.push('px-6', 'py-2.5', 'text-base', 'leading-5', 'max-h-10')
      } else if (this.xl) {
        classes.push('px-6', 'py-3')
      } else if (this.textLg) {
        classes.push('px-2', 'py-1', 'text-base')
      } else if (this.textSm) {
        classes.push('px-2', 'py-1', 'text-sm')
      } else if (this.textXs) {
        classes.push('px-2', 'py-1', 'text-2xs')
      }

      if (!this.disabled) {
        if (this.text || this.textLg || this.textXs || this.textSm) {
          const color = this.aqua
            ? ['text-aqua-500', 'hover:text-aqua-600']
            : this.red
            ? ['text-red-500', 'hover:text-red-600']
            : this.gray || this.default
            ? ['text-gray-500', 'hover:text-primary-500']
            : ['text-primary-500', 'hover:text-primary-600']

          classes.push('font-bold', 'tracking-wide', ...color)
        } else if (this.primary) {
          classes.push(
            'font-semibold',
            'bg-primary-500',
            'hover:bg-primary-400',
            'text-gray-800',
            'shadow-none'
          )
        } else if (this.aqua) {
          classes.push(
            'font-semibold',
            'bg-aqua-500',
            'hover:bg-aqua-400',
            'text-gray-800',
            'shadow-none'
          )
        } else if (this.red) {
          classes.push(
            'font-semibold',
            'bg-red-500',
            'hover:bg-red-400',
            'text-gray-800',
            'shadow-none'
          )
        } else if (this.light) {
          classes.push('bg-gray-200', 'text-gray-700', 'hover:bg-gray-100')
        } else if (this.outline) {
          classes.push(
            'text-white',
            'font-semibold',
            'border',
            'hover:text-primary-500',
            'border-primary-500'
          )
        } else if (this.redOutline) {
          classes.push(
            'bg-red-550',
            'bg-opacity-10',
            'text-red-550',
            'font-semibold',
            'border',
            'border-red-550',
            'border-opacity-30',
            'hover:text-red-500'
          )
        }
      }

      if (this.status.isLoading()) {
        classes.push('pointer-events-none', 'cursor-not-allowed')
      }

      return classes.join(' ')
    }
  }
})
</script>
