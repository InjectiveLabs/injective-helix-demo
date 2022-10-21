<template>
  <button class="flex justify-start gap-2" @click="handleClick">
    <div class="w-4 h-4 border border-white rounded-full p-[2px]">
      <div v-if="active" class="w-full h-full bg-white rounded-full" />
    </div>
    <div class="flex flex-col gap-2 justify-center items-start">
      <slot name="label" />
      <slot name="addon" />
    </div>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    active: {
      type: Boolean,
      required: true
    }
  },

  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
})
</script>
