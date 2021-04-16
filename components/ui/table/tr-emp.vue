<template>
  <v-ui-table-tr v-bind="$attrs" class="bg-dark-800 text-white">
    <slot></slot>
  </v-ui-table-tr>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  //
})
</script>
