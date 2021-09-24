<template>
  <span
    v-bind="$attrs"
    class="
      cursor-pointer
      text-gray-400
      hover:bg-gray-900
      border-l-3 border-transparent
      hover:text-white
      flex
      items-center
      px-8
      tracking-widest
      py-4
      uppercase
      text-xs
    "
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
