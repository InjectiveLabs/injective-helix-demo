<template>
  <div class="relative w-full h-full">
    <div class="absolute left-0 top-0 h-full w-full">
      <div
        class="
          h-full
          w-full
          flex
          items-center
          justify-center
          text-xs text-gray-500
        "
        :class="shadow ? 'shadow-md' : ''"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    shadow: {
      required: false,
      default: true,
      type: Boolean
    }
  }
})
</script>
