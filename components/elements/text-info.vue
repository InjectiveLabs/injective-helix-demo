<template>
  <p class="flex items-center text-xs">
    <span class="opacity-75">
      {{ title }}
    </span>
    <span class="flex-grow border-b border-dashed mx-4"></span>
    <span class="text-gray-100 font-semibold">
      <slot></slot>
    </span>
  </p>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      required: true,
      default: '',
      type: String
    }
  }
})
</script>
