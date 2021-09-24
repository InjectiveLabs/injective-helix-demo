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

    text: {
      required: false,
      default: false,
      type: Boolean
    },

    accentText: {
      required: false,
      default: false,
      type: Boolean
    },

    outline: {
      required: false,
      default: false,
      type: Boolean
    },

    textLg: {
      required: false,
      default: false,
      type: Boolean
    },

    primary: {
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
    classes() {
      const classes = ['text-center', 'rounded-3xl']

      if (this.disabled) {
        classes.push('pointer-events-none', 'text-gray-500', 'font-semibold')

        if (!this.text) {
          classes.push('border', 'border-gray-500')
        }
      }

      if (this.sm) {
        classes.push('px-2', 'py-1', 'text-xs')
      } else if (this.md) {
        classes.push('px-4', 'py-2', 'text-sm')
      } else if (this.lg) {
        classes.push('px-6', 'py-2.5', 'text-base', 'leading-5', 'max-h-10')
      } else if (this.textLg) {
        classes.push('px-2', 'py-1', 'text-base')
      }

      if (!this.disabled) {
        if (this.text || this.textLg) {
          classes.push(
            'font-bold',
            'tracking-wide',
            'text-primary-500',
            'hover:text-primary-400'
          )
        } else if (this.primary) {
          classes.push(
            'text-gray-200',
            'font-semibold',
            'bg-primary-500',
            'hover:bg-primary-400',
            'text-gray-800',
            'shadow-none'
          )
        } else if (this.accentText) {
          classes.push(
            'text-accent-200',
            'font-semibold',
            'hover:text-accent-100'
          )
        } else if (this.outline) {
          classes.push(
            'text-white',
            'font-semibold',
            'border',
            'hover:text-primary-500',
            'border-primary-500'
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
