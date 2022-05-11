<template>
  <v-market-layout @loaded="onLoad">
    <template slot="trading-panel">
      <v-balances />
      <v-trading class="mt-1 flex-1" />
    </template>

    <v-market-chart slot="chart" :market="market" class="hidden lg:block" />
    <v-orderbook slot="order-books" :market="market" />
    <v-orders slot="orders" />
    <div slot="modals">
      <v-market-untradable :market="market" />
    </div>
  </v-market-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/ui-common'
import VMarketLayout from '~/layouts/market.vue'
import VBalances from '~/components/partials/common/balances/index.vue'
import VTrading from '~/components/partials/spot/trading/index.vue'
import VMarketChart from '~/components/partials/common/market/chart.vue'
import VOrders from '~/components/partials/spot/orders.vue'
import VOrderbook from '~/components/partials/spot/orderbook.vue'
import VMarketUntradable from '~/components/partials/modals/market-untradable.vue'
import { Modal } from '~/types'
import { ORDERBOOK_POLLING_ENABLED } from '~/app/utils/constants'
import { unTradableMarketSlugs } from '~/app/data/market'

export default Vue.extend({
  components: {
    VMarketLayout,
    VTrading,
    VBalances,
    VOrders,
    VOrderbook,
    VMarketChart,
    VMarketUntradable
  },

  data() {
    return {
      interval: 0 as any
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    }
  },

  beforeDestroy() {
    clearInterval(this.interval)
  },

  methods: {
    onLoad() {
      Promise.all([
        this.setOrderbookPolling(),
        this.$accessor.spot.initMarketStreams()
      ])
        .then(() => {
          this.checkUnTradableMarket()
        })
        .catch(this.$onRejected)
    },

    checkUnTradableMarket() {
      if (unTradableMarketSlugs.includes(this.$route.params.spot)) {
        this.$accessor.modal.openModal(Modal.MarketUnTradable)
      }
    },

    setOrderbookPolling() {
      if (ORDERBOOK_POLLING_ENABLED) {
        this.interval = setInterval(async () => {
          await this.$accessor.spot.pollOrderbook()
        }, 2000)
      }
    }
  }
})
</script>
