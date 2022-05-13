<template>
  <v-market-layout hardcoded-slug="btc-usdt-perp">
    <template slot="trading-panel">
      <v-balances />
      <v-trading class="mt-1 flex-1" />
    </template>

    <template v-if="market">
      <v-market-chart slot="chart" :market="market" />
      <v-orderbook slot="order-books" :market="market" />
      <v-orders slot="orders" />
    </template>

    <div slot="modals">
      <v-modal-market-new v-if="marketIsNew" />
      <v-modal-market-deprecated
        v-if="deprecatedMarket"
        :market="deprecatedMarket"
      />
    </div>
  </v-market-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import VMarketLayout from '~/layouts/market.vue'
import VModalMarketNew from '~/components/partials/modals/market-new.vue'
import VModalMarketDeprecated from '~/components/partials/modals/market-deprecated.vue'
import VBalances from '~/components/partials/common/balances/index.vue'
import VTrading from '~/components/partials/derivatives/trading/index.vue'
import VMarketChart from '~/components/partials/common/market/chart.vue'
import VOrders from '~/components/partials/derivatives/orders.vue'
import VOrderbook from '~/components/partials/derivatives/orderbook.vue'
import { Modal } from '~/types'
import { deprecatedMarkets, upcomingMarkets } from '~/app/data/market'

export default Vue.extend({
  components: {
    VMarketLayout,
    VModalMarketNew,
    VModalMarketDeprecated,
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
    },

    marketIsNew(): boolean {
      const { market } = this.$route.params

      if (!market) {
        return false
      }

      return upcomingMarkets.map((m) => m.slug).includes(market)
    },

    deprecatedMarket():
      | UiSpotMarketWithToken
      | UiDerivativeMarketWithToken
      | undefined {
      const {
        $route: {
          params: { market: slug }
        }
      } = this

      return deprecatedMarkets.find((m) => m.slug === slug)
    }
  },

  created() {
    this.onLoad()
  },

  methods: {
    onLoad() {
      if (this.marketIsNew) {
        this.$accessor.modal.openModal(Modal.MarketNew)
      }

      if (this.deprecatedMarket) {
        this.$accessor.modal.openModal(Modal.MarketDeprecated)
      }
    }
  }
})
</script>
