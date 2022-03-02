<template>
  <div
    class="bg-gray-800 rounded-xl relative"
    :class="{
      'p-4 lg:p-6': lg && !tight,
      'p-4': md && !tight,
      'p-2 lg:p-3': !md && !lg && !tight
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
      type: Boolean,
      default: false
    },

    md: {
      type: Boolean,
      default: false
    },

    tight: {
      type: Boolean,
      default: false
    }
  }
})
</script>
