<template>
  <div class="flex items-center">
    <span>
      <v-ui-icon
        v-if="!right && $attrs['icon']"
        v-bind="$attrs"
        class="mr-2 align-middle"
      />
    </span>
    <slot></slot>
    <span>
      <v-ui-icon
        v-if="right && $attrs['icon']"
        v-bind="$attrs"
        class="mr-0 ml-1 align-middle"
      />
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    right: {
      required: false,
      default: false,
      type: Boolean
    }
  }
})
</script>
