<template>
  <div class="flex flex-col flex-wrap h-full">
    <v-table-head :market="market" />
    <div class="flex-1 w-full overflow-y-auto">
      <ul class="list-trades w-full">
        <v-trade
          v-for="(trade, index) in trades"
          :key="`trade-${index}`"
          :trade="trade"
        ></v-trade>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VTrade from './trade.vue'
import VTableHead from '~/components/partials/common/trades/table-head.vue'
import { UiSpotMarket, UiSpotTrade } from '~/types'

export default Vue.extend({
  components: {
    VTableHead,
    VTrade
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.trades
    }
  }
})
</script>
