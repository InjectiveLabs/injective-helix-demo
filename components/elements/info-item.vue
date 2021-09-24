<template>
  <div>
    <div class="text-xs sm:text-sm">
      <p
        class="
          col-span-
          uppercase
          font-semibold
          text-gray-800
          dark:text-gray-100
        "
      >
        <slot name="title" />
      </p>
      <p class="text-gray-600 mt-1 dark:text-gray-300 text-left break-words">
        <slot></slot>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>
