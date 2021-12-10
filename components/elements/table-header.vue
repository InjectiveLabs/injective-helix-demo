<template>
  <div
    class="grid-cols-12 gap-4 text-gray-200 uppercase md:grid hidden items-center"
    :class="[
      fontSizeClasses,
      dense ? 'px-4 py-4 bg-gray-900 rounded-t-2xl leading-3.5' : 'px-6 md:mb-4'
    ]"
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

    dense: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    fontSizeClasses(): String[] {
      const { sm } = this

      if (sm) {
        return ['text-2xs', 'xl:text-3xs', '2xl:text-2xs', '4xl:text-xs']
      }

      return ['text-2xs', '2xl:text-xs']
    }
  }
})
</script>
