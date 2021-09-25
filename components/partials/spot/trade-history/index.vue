<template>
  <div v-if="market" class="table-responsive min-h-3xs">
    <table class="table">
      <thead>
        <tr>
          <th class="text-right">
            {{ $t('price') }}
          </th>
          <th class="text-right">
            {{ $t('amount') }}
          </th>
          <th class="text-right">
            {{ $t('notional_size') }}
          </th>
          <th class="text-right">
            {{ $t('fee') }}
          </th>
          <th class="text-center">
            {{ $t('side') }}
          </th>
          <th class="text-center">
            {{ $t('execution_type') }}
          </th>
          <th class="text-right">
            {{ $t('time') }}
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
    <v-user-wallet-connect-warning v-if="!isUserWalletConnected" />
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
