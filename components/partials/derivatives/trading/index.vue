<template>
  <v-card class="w-full">
    <v-trade />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from './trade.vue'

export default Vue.extend({
  components: {
    'v-trade': Trade
  }
})
</script>
