<template>
  <div class="flex items-center justify-between">
    <span
      class="uppercase tracking-1 text-xs font-bold"
      :class="[bold ? 'text-gray-200' : 'text-gray-500']"
    >
      <slot name="title" />
    </span>
    <div
      class="flex flex-col-reverse xs:flex-row items-end xs:items-center justify-between"
    >
      <span class="text-gray-500 text-sm">
        <slot name="amountInUsd" />
      </span>
      <span
        class="text-gray-200 xs:ml-2"
        :class="[bold ? 'text-base' : 'text-sm']"
      >
        <slot name="amount" />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    bold: {
      type: Boolean,
      default: false
    }
  }
})
</script>
