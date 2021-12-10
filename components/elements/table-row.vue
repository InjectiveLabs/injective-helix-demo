<template>
  <div
    class="grid grid-cols-2 md:grid-cols-12 text-xs xs:text-sm lg:text-xs xl:text-sm gap-2 md:gap-4 text-gray-200 first:rounded-t-lg last:rounded-b-lg bg-gray-900 items-center"
    :class="[
      dense ? 'p-4 v-table-row-dense xs:leading-4' : 'v-table-row px-6 py-2'
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
    }
  }
})
</script>
