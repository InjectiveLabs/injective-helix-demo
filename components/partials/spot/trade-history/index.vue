<template>
  <div v-if="market" class="h-full">
    <div
      v-if="filteredTrades.length > 0 && isUserWalletConnected"
      class="table-responsive min-h-orders max-h-lg"
    >
      <table class="table">
        <trades-table-header />
        <tbody>
          <tr
            is="v-trade"
            v-for="(trade, index) in filteredTrades"
            :key="`trades-history-${index}-`"
            :trade="trade"
          ></tr>
        </tbody>
      </table>
    </div>
    <v-user-wallet-connect-warning
      v-else-if="!isUserWalletConnected"
      class="bg-gray-900 mt-2"
    />
    <v-empty-list v-else :message="$t('trade.emptyTrades')" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketWithToken,
  UiSpotTrade,
  UiSubaccount
} from '@injectivelabs/ui-common'
import Trade from '~/components/partials/common/spot/trade.vue'
import TradesTableHeader from '~/components/partials/common/spot/trades-table-header.vue'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader
  },

  props: {
    currentMarketOnly: {
      type: Boolean,
      default: false
    }
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

    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.subaccountTrades
    },

    subAccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    filteredTrades(): UiSpotTrade[] {
      const { currentMarketOnly, market, trades } = this

      if (!currentMarketOnly) {
        return trades
      }

      return trades.filter((trade) => trade.marketId === market?.marketId)
    },

    emptyTrades(): any[] {
      const { trades, limit } = this

      return trades.length < limit ? new Array(limit - trades.length) : []
    }
  },

  watch: {
    subAccount() {
      this.$accessor.spot.fetchSubaccountTrades()
    }
  }
})
</script>
