<template>
  <Market-layout hardcoded-slug="btc-usdt-perp">
    <template slot="trading-panel">
      <Balances />
      <Trading class="mt-1 flex-1" />
    </template>

    <template v-if="market">
      <Market-chart slot="chart" :market="market" />
      <Orderbook slot="order-books" :market="market" />
      <Orders slot="orders" />
    </template>

    <div slot="modals">
      <ModalMarketNew v-if="marketIsNew" />
      <ModalMarketDeprecated
        v-if="deprecatedMarket"
        :market="deprecatedMarket"
      />
    </div>
  </Market-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import MarketLayout from '~/layouts/market.vue'
import ModalMarketNew from '~/components/partials/modals/market-new.vue'
import ModalMarketDeprecated from '~/components/partials/modals/market-deprecated.vue'
import Balances from '~/components/partials/common/balances/index.vue'
import Trading from '~/components/partials/derivatives/trading/index.vue'
import MarketChart from '~/components/partials/common/market/chart.vue'
import Orders from '~/components/partials/derivatives/orders.vue'
import Orderbook from '~/components/partials/derivatives/orderbook.vue'
import { Modal } from '~/types'
import { deprecatedMarkets, upcomingMarkets } from '~/app/data/market'

type DeprecatedMarket =
  | UiSpotMarketWithToken
  | UiDerivativeMarketWithToken
  | undefined

export default Vue.extend({
  components: {
    MarketLayout,
    ModalMarketNew,
    ModalMarketDeprecated,
    Trading,
    Balances,
    Orders,
    Orderbook,
    MarketChart
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

    deprecatedMarket(): DeprecatedMarket {
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
