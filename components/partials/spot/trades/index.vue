<template>
  <div class="flex flex-col flex-wrap orderbook-h">
    <TableHead :market="market" />
    <div class="flex-1 w-full overflow-y-auto overflow-x-hidden rounded-b-lg">
      <ul class="list-trades w-full">
        <Trade
          v-for="(trade, index) in trades"
          :key="`trade-${index}`"
          :trade="trade"
        ></Trade>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotMarketWithToken, UiSpotTrade } from '@injectivelabs/sdk-ui-ts'
import Trade from './trade.vue'
import TableHead from '~/components/partials/common/trades/table-head.vue'

export default Vue.extend({
  components: {
    TableHead,
    Trade
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
