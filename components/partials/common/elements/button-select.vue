<template>
  <button
    type="button"
    role="button"
    class="rounded-2xl px-5 py-2 uppercase text-xs tracking-wid"
    :class="{
      'bg-black text-white dark:bg-gray-700 dark:shadow-dark-sm':
        isSelected,
      'text-gray-700 dark:text-gray-200':
        !isSelected
    }"
    @click="$emit('selected', option)"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
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
