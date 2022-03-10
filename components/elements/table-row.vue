<template>
  <div
    class="grid grid-cols-2 md:grid-cols-12 text-xs xs:text-sm lg:text-xs xl:text-sm gap-2 md:gap-4 text-gray-200 v-table-row items-center"
    :class="{
      'p-3 xs:leading-4': dense,
      'px-6 py-3': lg,
      'px-3 py-4': !dense && !lg
    }"
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

    lg: {
      type: Boolean,
      default: false
    }
  }
})
</script>
