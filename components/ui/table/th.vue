<template>
  <th :class="classes">
    <slot></slot>
  </th>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    right: {
      required: false,
      default: false,
      type: Boolean
    },

    center: {
      required: false,
      default: false,
      type: Boolean
    },

    left: {
      required: false,
      default: false,
      type: Boolean
    },

    width: {
      required: false,
      default: '',
      type: String
    }
  },
  computed: {
    classes(): string {
      const classes = [
        'text-gray-400',
        'text-sm',
        'font-light',
        'align-middle',
        'leading-tight',
        'bg-transparent',
        'border-none',
        'select-none',
        'px-3',
        'py-2',
        'whitespace-nowrap'
      ]

      if (this.right) {
        classes.push('text-right')
      } else if (this.center) {
        classes.push('text-center')
      } else if (this.left) {
        classes.push('text-left')
      }

      if (this.width) {
        classes.push(this.width)
      }

      return classes.join(' ')
    }
  }
})
</script>
