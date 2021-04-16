<template>
  <v-panel class="relative" content-class="w-full" :title="$t('trades')">
    <v-trades-context keep-alive></v-trades-context>
    <v-trades class="flex-1" />
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import Trades from './trades.vue'
import TradesContext from './trades-context.vue'

export default Vue.extend({
  components: {
    'v-trades': Trades,
    'v-trades-context': TradesContext
  }
})
</script>
