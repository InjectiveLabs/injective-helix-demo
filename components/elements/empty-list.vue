<template>
  <div
    class="h-full w-full flex flex-col items-center justify-center"
    :class="classes"
  >
    <img src="/svg/empty-list.svg" class="mx-auto mb-3" />
    <p class="text-sm">
      {{ message }}
    </p>

    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    message: {
      type: String,
      default: ''
    },

    classes: {
      type: String,
      default: 'bg-gray-900'
    }
  }
})
</script>
