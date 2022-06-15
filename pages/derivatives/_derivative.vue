<template>
  <MarketLayout @loaded="onLoad">
    <template slot="trading-panel">
      <Balances />
      <Trading class="mt-1 flex-1" />
    </template>

    <template v-if="market">
      <Market-chart slot="chart" :market="market" class="hidden lg:block" />
      <Orderbook slot="order-books" :market="market" />
      <Orders slot="orders" />
    </template>

    <div slot="modals">
      <ModalAddMargin />
    </div>
  </MarketLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import MarketLayout from '~/layouts/market.vue'
import ModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import Balances from '~/components/partials/common/balances/index.vue'
import Trading from '~/components/partials/derivatives/trading/index.vue'
import MarketChart from '~/components/partials/common/market/chart.vue'
import Orders from '~/components/partials/derivatives/orders.vue'
import Orderbook from '~/components/partials/derivatives/orderbook.vue'
import { ORDERBOOK_POLLING_ENABLED } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    MarketLayout,
    ModalAddMargin,
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
