<template>
  <span :class="classes" class="badge capitalize">
    <slot></slot>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    sm: {
      required: false,
      default: true,
      type: Boolean
    },

    xs: {
      required: false,
      default: true,
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

    dark: {
      required: false,
      default: false,
      type: Boolean
    },

    red: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    classes(): string {
      const classes = [
        'rounded',
        'cursor-default',
        'font-bold',
        'inline-flex',
        'leading-normal',
        'outline-none',
        'overflow-hidden',
        'text-decoration-none',
        'items-center',
        'shadow-md'
      ]

      if (this.lg) {
        classes.push('text-sm', 'px-4', 'py-1')
      } else if (this.md) {
        classes.push('text-sm', 'px-3', 'py-px')
      } else if (this.sm) {
        classes.push('text-xs', 'px-3', 'py-px')
      } else if (this.xs) {
        classes.push('text-2xs', 'px-2', 'py-px')
      }

      if (this.primary) {
        classes.push('bg-primary-500', 'text-primary-900')
      } else if (this.red) {
        classes.push('bg-red-500', 'text-red-900')
      } else if (this.aqua) {
        classes.push('bg-aqua-500', 'text-aqua-900')
      } else if (this.dark) {
        classes.push('bg-dark-500', 'text-gray-200')
      }

      return classes.join(' ')
    }
  }
})
</script>
