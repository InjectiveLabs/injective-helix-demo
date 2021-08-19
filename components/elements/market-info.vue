<template>
  <div class="px-4 w-auto md:px-2 lg:px-3 2xl:px-4 flex-grow-0 flex-shrink-0">
    <v-ui-text xs class="text-gray-500 mb-1 w-full text-right block">
      {{ title }}
      <slot name="icon"></slot>
    </v-ui-text>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      required: true,
      type: String
    }
  }
})
</script>
