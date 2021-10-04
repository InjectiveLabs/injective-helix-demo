<template>
  <div
    class="px-1 py-1 bg-gray-900 mr-4 rounded flex items-center justify-between border border-dark-500"
  >
    <span
      class="bg-gray-500 font-bold py-px px-2 uppercase text-gray-300 text-2xs mr-2 rounded flex items-center"
    >
      {{ title }}
    </span>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      required: true,
      type: String
    }
  }
})
</script>
