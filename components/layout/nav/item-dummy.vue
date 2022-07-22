<template>
  <span
    v-bind="$attrs"
    class="text-gray-200 hover:bg-gray-800 hover:text-white text-sm font-semibold rounded-lg cursor-pointer mx-px h-10 flex lg:flex items-center px-6"
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
