<template>
  <div
    class="px-4 py-2.5 rounded-3xl cursor-pointer bg-gray-800"
    :class="[
      active
        ? 'border border-primary-500 text-primary-500 hover:border-primary-600 hover:text-primary-600'
        : 'text-gray-500 border border-transparent hover:border-primary-500 hover:text-primary-500'
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
