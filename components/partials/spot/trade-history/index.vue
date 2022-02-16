<template>
  <div v-if="market" class="h-full">
    <div
      v-if="trades.length > 0 && isUserWalletConnected"
      class="table-responsive min-h-orders max-h-lg"
    >
      <table class="table">
        <trades-table-header />
        <tbody>
          <tr
            is="v-trade"
            v-for="(trade, index) in trades"
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
    <div v-else class="h-full w-full bg-gray-900 flex mt-2">
      <div class="grow text-center m-auto">
        <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
        <p>{{ $t('trade.emptyTrades') }}</p>
      </div>
    </div>
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
