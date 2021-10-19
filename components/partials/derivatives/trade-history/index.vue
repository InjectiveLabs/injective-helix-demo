<template>
  <div v-if="market" class="table-responsive table-orders">
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
import Trade from '~/components/partials/common/derivatives/trade.vue'
import TradesTableHeader from '~/components/partials/common/derivatives/trades-table-header.vue'
import { UiDerivativeMarket, UiDerivativeTrade } from '~/types'
import { UiSubaccount } from '~/types/subaccount'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.subaccountTrades
    },

    subAccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  watch: {
    subAccount() {
      this.$accessor.derivatives.fetchSubaccountMarketTrades()
    }
  }
})
</script>
