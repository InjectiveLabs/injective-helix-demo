<template>
  <div
    class="v-table-row px-6 grid grid-cols-2 md:grid-cols-12 text-xs xs:text-sm lg:text-xs xl:text-sm gap-2 md:gap-4 py-2 text-gray-200 first:rounded-t-lg last:rounded-b-lg bg-gray-900 items-center"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  //
})
</script>
