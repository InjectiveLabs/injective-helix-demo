<template>
  <p
    class="flex flex-wrap items-center w-full"
    :class="{
      'text-xs': !lg,
      'text-base': lg
    }"
  >
    <span class="opacity-75 flex items-center">
      {{ title }}
      <slot name="context" />
    </span>
    <span class="flex-grow border-b border-dashed mx-4"></span>
    <span class="text-gray-100 flex justify-end">
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
    },

    lg: {
      default: false,
      type: Boolean,
      required: false
    }
  }
})
</script>
