<template>
  <span class="text-xs text-gray-500" v-on="$listeners">
    <slot></slot>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  //
})
</script>
