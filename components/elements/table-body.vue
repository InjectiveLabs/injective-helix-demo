<template>
  <div class="grid grid-cols-1">
    <slot></slot>
    <div
      v-if="showEmpty"
      class="col-span-1 px-6 text-sm py-4 grid grid-cols-1 md:grid-cols-5 text-gray-200 rounded-lg bg-gray-900 items-center"
    >
      <slot name="empty"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    showEmpty: {
      type: Boolean,
      default: false
    }
  }
})
</script>
