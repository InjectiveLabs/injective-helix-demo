<template>
  <div
    class="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 text-gray-200 v-table-row items-center text-xs xs:text-sm lg:text-xs xl:text-sm"
    :class="[
      {
        'p-3 xs:leading-3': dense,
        'px-6 py-3': lg,
        'px-3 py-3': md,
        'px-3 py-4': isDefaultSize
      }
    ]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    dense: {
      type: Boolean,
      default: false
    },

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
    isDefaultSize(): boolean {
      const { md, lg, dense } = this

      return !md && !lg && !dense
    }
  }
})
</script>
