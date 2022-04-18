<template>
  <v-market-layout hardcoded-slug="btc-usdt-perp">
    <template slot="trading-panel">
      <v-balances />
      <v-trading class="mt-1 flex-1" />
    </template>

    <v-market-chart slot="chart" :market="market" />
    <v-orderbook slot="order-books" />
    <v-orders slot="orders" />

    <div slot="modals">
      <v-modal-market-new />
    </div>
  </v-market-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/ui-common'
import VMarketLayout from '~/layouts/market.vue'
import VModalMarketNew from '~/components/partials/modals/market-new.vue'
import VBalances from '~/components/partials/common/balances/index.vue'
import VTrading from '~/components/partials/derivatives/trading/index.vue'
import VMarketChart from '~/components/partials/common/market/chart.vue'
import VOrders from '~/components/partials/derivatives/orders.vue'
import VOrderbook from '~/components/partials/derivatives/orderbook.vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    VMarketLayout,
    VModalMarketNew,
    VTrading,
    VBalances,
    VOrders,
    VOrderbook,
    VMarketChart
  },

  data() {
    return {
      interval: 0 as any
    }
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    }
  },

  created() {
    this.$accessor.modal.openModal(Modal.MarketNew)
  }
})
</script>
