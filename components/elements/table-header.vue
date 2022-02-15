<template>
  <div
    class="grid-cols-12 gap-4 text-gray-200 uppercase md:grid hidden items-center mb-2"
    :class="classes"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    sm: {
      type: Boolean,
      default: false
    },

    md: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string {
      const { sm } = this
      const classes = []

      if (sm) {
        classes.push(
          'px-4',
          'py-2',
          'text-2xs',
          'xl:text-3xs',
          '2xl:text-2xs',
          '4xl:text-xs'
        )
      } else {
        classes.push('py-2', 'px-6', 'text-2xs', '2xl:text-xs')
      }

      return classes.join(' ')
    }
  }
})
</script>
