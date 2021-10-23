<template>
  <div class="flex-1">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <slot name="filters" />
      </div>

      <slot name="context" />
    </div>

    <div class="card-table-wrap-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>
