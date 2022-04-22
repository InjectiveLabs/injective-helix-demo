<template>
  <div
    class="h-2 w-2 rounded-full cursor-pointer"
    :class="[active ? 'bg-gray-500' : 'bg-gray-700']"
    @click="handleClick"
  />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    index: {
      type: Number,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleClick() {
      this.$emit('click', this.index)
    }
  }
})
</script>
