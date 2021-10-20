<template>
  <div>
    <div class="text-xs sm:text-sm">
      <p class="col-span-2 uppercase font-semibold text-gray-100">
        <slot name="title" />
      </p>
      <p class="text-gray-300 text-left break-words">
        <slot></slot>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>
