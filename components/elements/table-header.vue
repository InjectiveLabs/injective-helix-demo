<template>
  <div
    class="grid-cols-12 gap-4 text-gray-200 uppercase md:grid hidden items-center"
    :class="classes"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    md: {
      type: Boolean,
      default: false
    },

    lg: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string {
      const { lg } = this
      const classes = []

      if (lg) {
        classes.push('py-2', 'px-6', 'text-2xs', '2xl:text-xs')
      } else {
        classes.push('px-3', 'py-4', 'text-2xs', '2xl:text-xs')
      }

      return classes.join(' ')
    }
  }
})
</script>
