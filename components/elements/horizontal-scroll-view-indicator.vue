<template>
  <div
    class="w-2 h-2 rounded-full bg-white"
    :class="{ 'bg-opacity-50': active, 'bg-opacity-10': !active }"
  />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    active: {
      type: Boolean,
      required: true,
      default: false
    }
  }
})
</script>
