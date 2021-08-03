<template>
  <button :class="classes" type="button" class="relative" v-on="$listeners">
    <slot v-if="status && status.isNotLoading()"></slot>
    <span v-if="status && status.isLoading()" class="block w-full">
      <span class="spinner"></span>
    </span>
  </button>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    primary: {
      required: false,
      default: false,
      type: Boolean
    },

    secondary: {
      required: false,
      default: false,
      type: Boolean
    },

    red: {
      required: false,
      default: false,
      type: Boolean
    },

    aqua: {
      required: false,
      default: false,
      type: Boolean
    },

    hero: {
      required: false,
      default: false,
      type: Boolean
    },

    text: {
      required: false,
      default: false,
      type: Boolean
    },

    dim: {
      required: false,
      default: false,
      type: Boolean
    },

    '2xs': {
      required: false,
      default: false,
      type: Boolean
    },

    xs: {
      required: false,
      default: false,
      type: Boolean
    },

    sm: {
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

    wide: {
      required: false,
      default: false,
      type: Boolean
    },

    full: {
      required: false,
      default: false,
      type: Boolean
    },

    status: {
      required: false,
      type: Object as PropType<Status>,
      default: () => new Status()
    },

    ghost: {
      required: false,
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
      const classes = [
        'rounded-sm',
        'inline-block',
        'no-underline',
        'font-semibold',
        'text-center',
        'focus:outline-none'
      ]

      if (this.hero) {
        classes.shift()
      }

      if (this.status.isError()) {
        classes.push('border-red-500')
      }

      if (this.status.isLoading()) {
        // classes.push('min-w-btn')
      }

      if (this.wide) {
        classes.push('px-12', 'w-full')
        if (!this.sm) {
          classes.push('py-3')
        }
      }

      if (this.full) {
        classes.push('w-full')
        if (!this.sm) {
          classes.push('py-3')
        }
      }

      if (this['2xs']) {
        classes.push('h-4', 'text-2xs', 'py-px', 'leading-none', 'px-1')
      } else if (this.xs) {
        classes.push('h-6', 'text-2xs', 'py-px', 'leading-none', 'px-1')
      } else if (this.sm) {
        if (this.hero) {
          classes.push('h-10', 'leading-normal', 'text-xs', 'px-8')
        } else {
          classes.push('h-8', 'leading-normal', 'text-xs', 'px-4')
        }
      } else if (this.md) {
        if (this.hero) {
          classes.push('h-12', 'text-xs', 'px-6', 'leading-normal')
        } else {
          classes.push('h-10', 'leading-normal', 'px-6', 'text-xs')
        }
      } else if (this.lg) {
        classes.push('h-12', 'text-lg', 'px-6', 'leading-normal')
      } else {
        classes.push('h-12', 'px-6', 'text-xs')
      }

      if (this.primary) {
        if (this.text) {
          classes.push('text-primary-500', 'hover:text-primary-600')
        } else {
          classes.push(
            'bg-primary-500',
            'text-primary-900',
            'hover:bg-primary-600'
          )
        }
      } else if (this.secondary) {
        classes.push(
          'bg-secondary-500',
          'text-secondary-900',
          'hover:bg-secondary-600'
        )
      } else if (this.red) {
        classes.push('bg-red-500', 'text-white-900', 'hover:bg-red-600')
      } else if (this.aqua) {
        classes.push('bg-aqua-500', 'text-aqua-900', 'hover:bg-aqua-600')
      } else if (this.dim) {
        classes.push('bg-dark-700', 'hover:bg-dark-800')
      } else if (this.ghost) {
        classes.push('border border-dark-600 text-gray-500 hover:text-gray-300')
      }

      if (this.status.isLoading()) {
        classes.push('pointer-events-none', 'cursor-not-allowed', 'opacity-75')
      }

      if (this.disabled) {
        classes.push('pointer-events-none', 'cursor-disabled')
        if (!this.ghost) {
          classes.push('opacity-50')
        } else {
          classes.push('text-gray-500')
        }
      }

      return classes.join(' ')
    }
  }
})
</script>
