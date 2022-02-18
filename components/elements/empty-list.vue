<template>
  <div class="w-full bg-gray-900 flex py-2 rounded-sm h-full">
    <div class="grow text-center m-auto">
      <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
      <p>
        <slot></slot>
        {{ message }}
      </p>
    </div>
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
