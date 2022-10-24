<template>
  <MarketLayout @loaded="onLoad">
    <template slot="trading-panel">
      <InsufficientGas />
      <Balances />
      <Trading class="mt-1 flex-1" />
    </template>

    <template v-if="market">
      <MarketChart slot="chart" :market="market" class="hidden lg:block" />
      <Orderbook slot="order-books" :market="market" />
      <Orders slot="orders" />
    </template>

    <div slot="modals">
      <ModalAddMargin />
      <ModalMarketExpired v-if="marketIsExpired" :market="market" />
    </div>
  </MarketLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  MarketType,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import MarketLayout from '~/layouts/market.vue'
import ModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import ModalMarketExpired from '~/components/partials/modals/market-expired.vue'
import Balances from '~/components/partials/common/balances/index.vue'
import Trading from '~/components/partials/derivatives/trading/index.vue'
import MarketChart from '~/components/partials/common/market/chart.vue'
import Orders from '~/components/partials/derivatives/orders.vue'
import Orderbook from '~/components/partials/derivatives/orderbook.vue'
import { ORDERBOOK_POLLING_ENABLED } from '~/app/utils/constants'
import InsufficientGas from '~/components/partials/common/elements/insufficient-gas.vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    MarketLayout,
    ModalMarketExpired,
    ModalAddMargin,
    Trading,
    Balances,
    Orders,
    Orderbook,
    MarketChart,
    InsufficientGas
  },

  data() {
    return {
      interval: 0 as any,
      now: Date.now() / 1000
    }
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    marketIsExpired(): boolean {
      const { market, now } = this

      if (!market) {
        return false
      }

      if (market.subType !== MarketType.Futures) {
        return false
      }

      const expiryFuturesMarket = market as UiExpiryFuturesMarketWithToken

      if (!expiryFuturesMarket.expiryFuturesMarketInfo) {
        return false
      }

      return (
        expiryFuturesMarket.expiryFuturesMarketInfo.expirationTimestamp <= now
      )
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
        .finally(() => {
          if (this.marketIsExpired) {
            this.$accessor.modal.openModal({ type: Modal.MarketExpired })
          }
        })
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
