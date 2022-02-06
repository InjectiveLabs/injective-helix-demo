<template>
  <div
    class="px-4 py-6 w-full border-t-4 cursor-pointer shadow-card"
    :class="{
      'bg-gray-800 text-gray-300  border-primary-500 rounded-b-md': isSelected,
      'bg-gray-850 text-gray-500 border-transparent rounded-md': !isSelected
    }"
    @click="$emit('selected', option)"
  >
    <div class="flex items-center -mt-1">
      <span
        class="w-6 h-6 rounded-full block mr-4"
        :class="{ 'bg-primary-500': isSelected, 'bg-gray-600': !isSelected }"
      ></span>
      <span class="text-base">
        <slot></slot>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  model: {
    prop: 'value',
    event: 'selected'
  },

  props: {
    value: {
      required: true,
      type: [String, Number]
    },

    option: {
      required: true,
      type: [String, Number]
    }
  },

  computed: {
    isSelected(): boolean {
      return this.option === this.value
    }
  }
})
</script>
