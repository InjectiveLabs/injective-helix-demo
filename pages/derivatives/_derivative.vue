<template>
  <v-market-layout @loaded="onLoad">
    <template slot="trading-panel">
      <v-balances />
      <v-trading class="mt-1 flex-1" />
    </template>

    <v-market-chart slot="chart" :market="market" />
    <v-orderbook slot="order-books" />
    <v-orders slot="orders" />

    <div slot="modals">
      <v-modal-add-margin />
    </div>
  </v-market-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/ui-common'
import VMarketLayout from '~/layouts/market.vue'
import VModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import VBalances from '~/components/partials/common/balances/index.vue'
import VTrading from '~/components/partials/derivatives/trading/index.vue'
import VMarketChart from '~/components/partials/common/market/chart.vue'
import VOrders from '~/components/partials/derivatives/orders.vue'
import VOrderbook from '~/components/partials/derivatives/orderbook.vue'
import { ORDERBOOK_POLLING_ENABLED } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VMarketLayout,
    VModalAddMargin,
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

  beforeDestroy() {
    clearInterval(this.interval)
  },

  methods: {
    onLoad() {
      Promise.all([
        this.setOrderbookPolling(),
        this.$accessor.derivatives.initMarketStreams()
      ])
        .then(() => {})
        .catch(this.$onRejected)
    },

    setOrderbookPolling() {
      if (ORDERBOOK_POLLING_ENABLED) {
        this.interval = setInterval(async () => {
          await this.$accessor.derivatives.pollOrderbook()
        }, 2000)
      }
    }
  }
})
</script>
