<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <slot name="filters" />
      </div>

      <slot name="context" />
    </div>

    <div>
      <slot name="mobile-context" />
    </div>

    <div
      :class="{
        'card-table-wrap-content': !bgLighter,
        'card-table-wrap-content-lighter': bgLighter
      }"
    >
      <div class="card-table-wrap-content">
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
