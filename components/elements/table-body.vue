<template>
  <div
    class="grid grid-cols-1"
    :class="{ 'rounded-lg overflow-hidden': round }"
  >
    <slot></slot>
    <div
      v-if="showEmpty"
      class="col-span-1 px-6 text-sm py-4 text-gray-200 items-center rounded"
      :class="{ 'bg-gray-850': light, 'bg-gray-900': !light }"
    >
      <slot name="empty" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    light: {
      type: Boolean,
      default: false
    },

    showEmpty: {
      type: Boolean,
      default: false
    },

    round: {
      type: Boolean,
      default: false
    }
  }
})
</script>
