<template>
  <div class="w-full flex flex-col items-end">
    <span class="text-gray-200 mb-1">{{ value }}%</span>
    <div class="w-full h-2 rounded bg-helixGray-500 overflow-hidden">
      <div class="w-full h-2 bg-white origin-top-left" :style="style" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    value: {
      type: Number,
      required: true
    }
  },

  computed: {
    style(): string {
      const { value } = this

      return `transform: scaleX(${value / 100})`
    }
  }
})
</script>
