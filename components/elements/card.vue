<template>
  <div
    class="bg-gray-800 rounded-xl"
    :class="{
      'p-4 lg:p-6': lg && !tight,
      'p-2 lg:p-3': !lg && !tight
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    lg: {
      required: false,
      type: Boolean,
      default: false
    },

    tight: {
      required: false,
      type: Boolean,
      default: false
    }
  }
})
</script>
