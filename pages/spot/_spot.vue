<template>
  <HOCLoading :key="$route.fullPath" :status="status">
    <div v-if="market" class="flex flex-wrap h-full w-full mb-2">
      <div class="w-full">
        <v-market />
      </div>
      <div class="w-full lg:w-1/4 lg:px-1 mt-2">
        <v-balances />
        <v-trading class="mt-2" />
      </div>
      <div class="w-full lg:w-3/4 lg:px-1 mt-2">
        <v-card tight>
          <div class="flex flex-wrap -mx-1">
            <div class="w-full lg:w-2/3 px-1">
              <v-market-chart :market="market" />
            </div>
            <div class="w-full lg:w-1/3 px-1">
              <v-orderbook class="p-2 lg:p-3" />
            </div>
          </div>
        </v-card>
        <v-card class="mt-2">
          <div class="w-full">
            <v-orders />
          </div>
        </v-card>
      </div>
      <v-modal-bridge-deposit />
      <v-modal-bridge-withdraw />
      <v-modal-subaccount-deposit />
      <v-modal-subaccount-withdraw />
    </div>
  </HOCLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VModalBridgeDeposit from '~/components/partials/modals/bridge-deposit/index.vue'
import VModalBridgeWithdraw from '~/components/partials/modals/bridge-withdraw/index.vue'
import VModalSubaccountDeposit from '~/components/partials/modals/subaccount-deposit/index.vue'
import VModalSubaccountWithdraw from '~/components/partials/modals/subaccount-withdraw/index.vue'
import VBalances from '~/components/partials/common/balances/index.vue'
import VTrading from '~/components/partials/spot/trading/index.vue'
import VMarketChart from '~/components/partials/common/market/chart.vue'
import VMarket from '~/components/partials/spot/market.vue'
import VOrders from '~/components/partials/spot/orders.vue'
import VOrderbook from '~/components/partials/spot/orderbook.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import { UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    HOCLoading,
    VModalBridgeDeposit,
    VModalBridgeWithdraw,
    VModalSubaccountDeposit,
    VModalSubaccountWithdraw,
    VTrading,
    VBalances,
    VOrders,
    VOrderbook,
    VMarketChart,
    VMarket
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: 0 as any
    }
  },

  computed: {
    slugFromRoute(): string {
      const { params } = this.$route

      return params.spot
    },

    marketFromRoute(): UiSpotMarket | undefined {
      const { markets, slugFromRoute } = this

      return markets.find(
        (m) => m.slug.toLowerCase() === slugFromRoute.toLowerCase()
      )
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    }
  },

  mounted() {
    this.$accessor.spot
      .changeMarket(this.marketFromRoute)
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.spot.reset()
    clearInterval(this.interval)
  },

  methods: {
    //
  }
})
</script>
