<template>
  <v-panel>
    <tabs v-model="component" class="w-full">
      <tab :label="`${$t('open_orders')} (${orders.length})`">
        <v-open-orders class="relative" />
      </tab>
      <tab :label="$t('trade_history')">
        <v-trade-history class="relative" />
      </tab>
    </tabs>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'
import { UiDerivativeLimitOrder } from '~/types'

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
    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    }
  }
})
</script>
