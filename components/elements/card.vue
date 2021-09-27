<template>
  <div
    class="bg-gray-800 rounded-xl shadow-card"
    :class="{
      'p-4 lg:p-6': lg,
      'p-2 lg:p-4': !lg
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
    }
  }
})
</script>
