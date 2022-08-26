<template>
  <div
    class="group px-4 h-[40px] cursor-pointer relative flex items-center justify-center"
    :class="{ 'text-gray-300': !active, 'text-primary-500': active }"
    @click="handleTypeClick"
  >
    <p class="text-sm capitalize select-none whitespace-nowrap">
      <slot />
    </p>
    <div class="group-hover:block absolute inset-0 pointer-events-none" :class="{ 'hidden': !active }">
      <div class="h-[2px] w-full bg-primary-500 absolute bottom-0" />
    </div>
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
