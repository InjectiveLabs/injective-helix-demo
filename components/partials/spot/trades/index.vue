<template>
  <div class="flex flex-col flex-wrap orderbook-h">
    <v-table-head :market="market" />
    <div class="flex-1 w-full overflow-y-auto overflow-x-hidden rounded-b-lg">
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
import { UiSpotMarketWithToken, UiSpotTrade } from '@injectivelabs/ui-common'
import VTrade from './trade.vue'
import VTableHead from '~/components/partials/common/trades/table-head.vue'

export default Vue.extend({
  components: {
    VTableHead,
    VTrade
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.trades
    }
  }
})
</script>
