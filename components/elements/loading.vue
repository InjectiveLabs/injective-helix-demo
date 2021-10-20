<template>
  <div class="absolute left-0 top-0 h-full w-full">
    <div class="h-full w-full flex flex-col items-center justify-center">
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
  }
})
</script>
