<template>
  <div
    class="bg-gray-900 h-full w-full flex flex-col items-center justify-center"
  >
    <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
    <p>
      <slot></slot>
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    message: {
      required: false,
      type: String,
      default: ''
    }
  }
})
</script>
