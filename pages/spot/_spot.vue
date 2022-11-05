<template>
  <div>
    <MarketLayout @loaded="onLoad">
      <template slot="trading-panel">
        <InsufficientGasWarning />
        <Balances />
        <Trading class="mt-1 flex-1" />
      </template>

      <template v-if="market">
        <MarketChart slot="chart" :market="market" class="hidden lg:block" />
        <Orderbook slot="order-books" :market="market" />
        <Orders slot="orders" />
      </template>
    </MarketLayout>

    <Bridge />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import MarketLayout from '~/layouts/market.vue'
import Balances from '~/components/partials/common/balances/index.vue'
import Trading from '~/components/partials/spot/trading/index.vue'
import MarketChart from '~/components/partials/common/market/chart.vue'
import Orders from '~/components/partials/spot/orders.vue'
import Orderbook from '~/components/partials/spot/orderbook.vue'
import InsufficientGasWarning from '~/components/partials/common/trade/insufficient-gas-warning.vue'
import { ORDERBOOK_POLLING_ENABLED } from '~/app/utils/constants'
import Bridge from '~/components/partials/portfolio/bridge.vue'

export default Vue.extend({
  components: {
    MarketLayout,
    Trading,
    Balances,
    Orders,
    Orderbook,
    MarketChart,
    InsufficientGasWarning,
    Bridge
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
        this.$accessor.bank.fetchBankBalancesWithToken(),
        this.setOrderbookPolling(),
        this.$accessor.spot.initMarketStreams()
      ])
        .then(() => {
          //
        })
        .catch(this.$onRejected)
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
