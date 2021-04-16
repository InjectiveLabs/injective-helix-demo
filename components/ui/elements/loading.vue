<template>
  <div
    class="absolute left-0 top-0 h-full w-full"
    :class="{
      'bg-dark-700': bg
    }"
  >
    <div class="h-full w-full flex flex-col items-center justify-center">
      <v-ui-spinner v-bind="$attrs" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    bg: {
      required: false,
      type: Boolean,
      default: true
    }
  }
})
</script>
