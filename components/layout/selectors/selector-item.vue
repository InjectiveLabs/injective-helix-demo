<template>
  <div class="py-2 hover:bg-gray-700 text-gray-200" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    darkMode: {
      type: Boolean,
      default: false
    },

    item: {
      type: [Object, String],
      required: true
    }
  },

  methods: {
    handleClick() {
      const { item } = this

      this.$emit('click', item)
    }
  }
})
</script>
