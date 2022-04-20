<template>
  <div
    class="tracking-widest text-xs uppercase cursor-pointer select-none"
    :class="[active ? 'font-bold text-gray-200' : 'text-gray-500']"
    @click="handleTypeClick"
  >
    <slot />
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
