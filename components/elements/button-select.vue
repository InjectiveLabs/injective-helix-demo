<template>
  <button
    type="button"
    role="button"
    :class="classes"
    @click="$emit('selected', option)"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  model: {
    prop: 'value',
    event: 'selected'
  },

  props: {
    value: {
      required: true,
      type: [String, Number]
    },

    option: {
      required: true,
      type: [String, Number]
    },

    text: {
      type: Boolean,
      required: false,
      default: false
    },

    primary: {
      type: Boolean,
      required: false,
      default: false
    },

    xs: {
      type: Boolean,
      required: false,
      default: false
    },

    aqua: {
      type: Boolean,
      required: false,
      default: false
    },

    red: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    isSelected(): boolean {
      return this.option === this.value
    },

    classes(): string {
      const classes = [
        'uppercase',
        'rounded-2xl',
        'text-xs',
        'tracking-wide',
        'outline-none',
        'focus:outline-none'
      ]

      if (!this.text) {
        classes.push('bg-gray-900')
      } else {
        classes.push('font-semibold')
      }

      if (!this.xs) {
        classes.push('px-5', 'py-2', 'text-xs')
      } else {
        classes.push('px-2', 'py-2', 'text-2xs')
      }

      if (this.isSelected) {
        if (this.primary) {
          classes.push('text-primary-500', 'border', 'border-primary-500')
        } else if (this.aqua) {
          classes.push('text-aqua-500', 'border', 'border-aqua-500')
        } else if (this.red) {
          classes.push('text-red-500', 'border', 'border-red-500')
        } else if (this.text) {
          classes.push('text-primary-500')
        } else {
          classes.push('text-gray-100')
        }
      } else {
        classes.push('text-gray-300')
      }

      return classes.join(' ')
    }
  }
})
</script>
