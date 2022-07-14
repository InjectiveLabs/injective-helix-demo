<template>
  <div
    class="border border-gray-700 hover:border-primary-500 py-4 px-2 rounded-lg cursor-pointer"
  >
    <a :href="link" target="_blank">
      <div
        class="text-primary-900 bg-primary-500 hover:bg-primary-200 rounded-full mx-auto w-12 h-12 flex items-center justify-center"
      >
        <slot name="icon" />
      </div>
      <h3 class="mt-4 font-semibold text-center text-base">
        <slot name="title" />
      </h3>
      <p class="text-xs text-gray-300 text-center">
        <slot />
      </p>
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    link: {
      type: String,
      required: true
    }
  }
})
</script>
