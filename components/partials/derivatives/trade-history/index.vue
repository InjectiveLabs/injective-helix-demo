<template>
  <div v-if="market" class="table-responsive min-h-3xs">
    <table class="table">
      <thead>
        <tr>
          <th class="text-right">
            <span>{{ $t('price') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('amount') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('notional_size') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('fee') }}</span>
          </th>
          <th class="text-center">
            <span>{{ $t('side') }}</span>
          </th>
          <th class="text-center">
            <span>{{ $t('execution_type') }}</span>
          </th>
          <th class="text-right">
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
    <v-user-wallet-connect-warning v-if="!isUserWalletConnected" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from './trade.vue'
import { UiDerivativeMarket, UiDerivativeTrade } from '~/types'
import { UiSubaccount } from '~/types/subaccount'

export default Vue.extend({
  components: {
    'v-trade': Trade
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
