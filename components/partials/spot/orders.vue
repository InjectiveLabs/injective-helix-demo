<template>
  <v-panel :class="{ 'wallet-not-connected': !isUserWalletConnected }">
    <v-ui-overlay v-if="!isUserWalletConnected">
      <p>{{ $t('not_connect_orders') }}</p>
    </v-ui-overlay>
    <template v-else>
      <tabs v-model="component" class="w-full">
        <tab :label="$t('open_orders')">
          <v-open-orders class="relative" />
        </tab>
        <tab :label="$t('trade_history')">
          <v-trade-history class="relative" />
        </tab>
      </tabs>
    </template>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'

const components = {
  openOrders: 0,
  orderHistory: 1,
  tradeHistory: 2
}

export default Vue.extend({
  components: {
    'v-trade-history': TradeHistory,
    'v-open-orders': OpenOrders
  },

  data() {
    return {
      components,
      component: components.openOrders
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
