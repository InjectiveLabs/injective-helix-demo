<template>
  <div
    v-if="market"
    class="table-responsive min-h-orders max-h-xs 4xl:max-h-lg"
  >
    <table class="table">
      <trades-table-header />
      <tbody v-if="isUserWalletConnected">
        <tr
          is="v-trade"
          v-for="(trade, index) in trades"
          :key="`trades-history-${index}-`"
          :trade="trade"
        ></tr>
      </tbody>
    </table>
    <v-user-wallet-connect-warning v-if="!isUserWalletConnected" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from '~/components/partials/common/spot/trade.vue'
import TradesTableHeader from '~/components/partials/common/spot/trades-table-header.vue'
import { UiSpotMarket, UiSpotTrade } from '~/types'
import { UiSubaccount } from '~/types/subaccount'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader
  },

  data() {
    return {
      limit: 9
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.subaccountTrades
    },

    subAccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    emptyTrades(): any[] {
      const { trades, limit } = this

      return trades.length < limit ? new Array(limit - trades.length) : []
    }
  },

  watch: {
    subAccount() {
      this.$accessor.spot.fetchSubaccountMarketTrades()
    }
  }
})
</script>
