<template>
  <span class="cursor-pointer" @click="handleClick"><slot></slot></span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    type: {
      type: String,
      required: true
    }
  },

  methods: {
    handleClick() {
      const { type } = this

      this.$emit('click', type)
    }
  }
})
</script>
