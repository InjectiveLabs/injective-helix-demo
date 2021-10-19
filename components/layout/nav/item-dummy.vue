<template>
  <span
    v-bind="$attrs"
    class="text-gray-200 hover:bg-gray-800 hover:text-white flex items-center px-6 tracking-widest py-2 uppercase text-xs rounded cursor-pointer mx-px"
    v-on="$listeners"
  >
    <span class="block">
      <slot></slot>
    </span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  //
})
</script>
