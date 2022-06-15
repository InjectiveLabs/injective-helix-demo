<template>
  <VCard class="w-full h-full">
    <Trade />
  </VCard>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from './trade.vue'

export default Vue.extend({
  components: {
    Trade
  }
})
</script>
