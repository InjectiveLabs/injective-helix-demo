<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="grid grid-cols-12 z-10">
      <slot name="actions" />
    </div>

    <div
      :class="{
        'card-table-wrap-content': !bgLighter,
        'card-table-wrap-content-lighter': bgLighter
      }"
    >
      <div class="h-full relative">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    bgLighter: {
      required: false,
      type: Boolean,
      default: false
    }
  }
})
</script>
