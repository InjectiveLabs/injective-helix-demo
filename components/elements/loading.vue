<template>
  <div class="absolute left-0 top-0 h-full w-full">
    <div
      class="h-full w-full flex items-center"
      :class="{
        'justify-start': left,
        'justify-end': right,
        'justify-center': !left && !right
      }"
    >
      <v-logo-spinner v-bind="$attrs" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VLogoSpinner from './logo-spinner.vue'

export default Vue.extend({
  components: {
    VLogoSpinner
  },

  props: {
    left: {
      type: Boolean,
      default: false
    },

    right: {
      type: Boolean,
      default: false
    }
  }
})
</script>
