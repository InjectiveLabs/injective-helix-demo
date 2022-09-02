<template>
  <div class="w-full h-full px-6 py-4 bg-helixGray-950 rounded-xl relative">
    <Trade />
  </div>
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
