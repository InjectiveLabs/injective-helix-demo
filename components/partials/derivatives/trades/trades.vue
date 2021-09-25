<template>
  <div class="w-full">
    <ul class="list-trades w-full h-md overflow-y-auto">
      <v-trade
        v-for="(trade, index) in trades"
        :key="`trade-${index}`"
        :trade="trade"
      ></v-trade>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from './trade.vue'
import { UiDerivativeTrade } from '~/types'

export default Vue.extend({
  components: {
    'v-trade': Trade
  },

  computed: {
    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.trades
    }
  }
})
</script>
