<template>
  <div
    class="px-4 py-2.5 cursor-pointer"
    :class="[
      active
        ? 'border-2 border-transparent border-b-primary-500 text-primary-500'
        : 'text-gray-300 border-2 border-transparent hover:border-b-primary-500 hover:text-primary-500'
    ]"
    @click="handleTypeClick"
  >
    <p class="text-sm capitalize select-none whitespace-nowrap"><slot /></p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    type: {
      type: String,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleTypeClick() {
      this.$emit('click', this.type)
    }
  }
})
</script>
