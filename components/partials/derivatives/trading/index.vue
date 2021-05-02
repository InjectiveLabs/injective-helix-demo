<template>
  <v-panel class="h-full" :title="$t('trading')">
    <v-trade />
  </v-panel>
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
