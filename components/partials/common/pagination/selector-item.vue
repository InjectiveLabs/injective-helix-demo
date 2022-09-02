
<template>
  <div class="py-1 bg-gray-900 hover:bg-gray-850" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    item: {
      type: [String, Number, Object],
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
