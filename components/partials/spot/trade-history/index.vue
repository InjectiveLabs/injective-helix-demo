<template>
  <div v-if="market" class="table-responsive min-h-3xs">
    <table class="table">
      <thead>
        <tr>
          <th is="v-ui-table-th" right class="text-xs">
            <span>{{ $t('price') }}</span>
          </th>
          <th is="v-ui-table-th" right class="text-xs">
            <span>{{ $t('amount') }}</span>
          </th>
          <th is="v-ui-table-th" right class="text-xs">
            <span>{{ $t('notional_size') }}</span>
          </th>
          <th is="v-ui-table-th" right class="text-xs">
            <span>{{ $t('fee') }}</span>
          </th>
          <th is="v-ui-table-th" center class="text-xs">
            <span>{{ $t('side') }}</span>
          </th>
          <th is="v-ui-table-th" center class="text-xs">
            <span>{{ $t('execution_type') }}</span>
          </th>
          <th is="v-ui-table-th" right class="text-xs">
            <span>{{ $t('time') }}</span>
          </th>
        </tr>
      </thead>
      <tbody v-if="isUserWalletConnected">
        <tr
          is="v-trade"
          v-for="(trade, index) in trades"
          :key="`trades-history-${index}-`"
          :trade="trade"
        ></tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from './trade.vue'
import { UiSpotMarket, UiSpotTrade } from '~/types'
import { UiSubaccount } from '~/types/subaccount'

export default Vue.extend({
  components: {
    'v-trade': Trade
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
