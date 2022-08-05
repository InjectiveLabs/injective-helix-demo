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
      <span class="button-spinner" :class="spinnerClasses" />
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

    green: {
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
    classes(): string {
      const classes = ['text-center', 'rounded', 'focus:outline-none']

      if (this.disabled) {
        if (this.outline) {
          classes.push(
            'pointer-events-none',
            'text-helixGray-500',
            'bg-transparent',
            'border',
            'border-helixGray-500'
          )
        } else {
          classes.push('pointer-events-none', 'text-white', 'bg-helixGray-500')
        }
      }

      if (this.sm) {
        classes.push('px-2', 'py-1', 'text-xs')
      } else if (this.md) {
        classes.push('px-4', 'py-2', 'text-sm')
      } else if (this.lg) {
        classes.push('px-6', 'py-2.5', 'text-sm', 'font-semibold', 'max-h-10')
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
            : this.green
            ? ['text-green-500', 'hover:text-green-600']
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
            'text-white',
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
        } else if (this.green) {
          classes.push(
            'font-semibold',
            'bg-green-500',
            'hover:bg-green-600',
            'text-white',
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
            'bg-red-500',
            'bg-opacity-10',
            'text-red-500',
            'hover:text-red-600',
            'hover:bg-red-600',
            'hover:bg-opacity-10'
          )
        }
      }

      if (this.status.isLoading()) {
        classes.push('pointer-events-none', 'cursor-not-allowed')
      }

      return classes.join(' ')
    },

    spinnerClasses(): string {
      const classes = ['top-0', 'left-0', 'mx-auto', 'block', 'w-4', 'h-4', 'border-2', 'rounded-full', 'border-transparent', 'bg-transparent']

      if (this.sm) {
        classes.push('h-3', 'w-3')
      } else if (this.lg) {
        classes.push('h-[14px]', 'w-[14px]')
      } else if (this.xl) {
        classes.push('h-6', 'w-6')
      }

      if (this.outline) {
        classes.push('text-primary-500')
      }

      return classes.join(' ')
    }
  }
})
</script>
