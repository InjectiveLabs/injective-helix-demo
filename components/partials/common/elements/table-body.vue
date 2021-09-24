<template>
  <div class="grid grid-cols-1 gap-6">
    <slot></slot>
    <div
      v-if="showEmpty"
      class="col-span-1 px-6 text-sm py-4 grid grid-cols-1 md:grid-cols-5 shadow text-gray-200 rounded-2xl bg-gray-900 items-center"
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
