<template>
  <div class="flex items-center justify-between">
    <span class="text-sm text-gray-500">
      <slot name="title" />
    </span>
    <div
      class="flex flex-col-reverse xs:flex-row items-end xs:items-center justify-between"
    >
      <span class="text-gray-500 text-sm">
        <slot name="amountInUsd" />
      </span>
      <span class="text-gray-200 xs:ml-2 text-sm">
        <slot name="amount" />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>
