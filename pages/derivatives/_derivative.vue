<template>
  <HOCLoading :key="$route.fullPath" :status="status">
    <div v-if="market" class="min-h-screen flex flex-col flex-wrap">
      <div class="w-full px-1">
        <v-market />
      </div>
      <div class="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-1 p-1">
        <div class="col-span-6 lg:col-span-3 4xl:col-span-2">
          <div class="flex flex-col flex-wrap h-full w-full">
            <v-balances />
            <v-trading class="mt-1 flex-1" />
          </div>
        </div>
        <div class="col-span-6 lg:col-span-9 4xl:col-span-10">
          <div class="flex flex-wrap flex-col w-full h-full">
            <div class="w-full">
              <v-card tight>
                <div class="grid grid-cols-6 lg:grid-cols-12">
                  <div class="col-span-6 lg:col-span-8 4xl:col-span-9">
                    <v-market-chart :market="market" />
                  </div>
                  <div class="col-span-6 lg:col-span-4 4xl:col-span-3">
                    <v-orderbook class="p-2 lg:p-3" />
                  </div>
                </div>
              </v-card>
            </div>
            <div class="w-full flex-1 mt-1">
              <v-card class="h-full">
                <v-orders />
              </v-card>
            </div>
          </div>
        </div>
      </div>
      <v-modal-bridge-deposit />
      <v-modal-bridge-withdraw />
      <v-modal-subaccount-deposit />
      <v-modal-subaccount-withdraw />
      <v-modal-add-margin />
    </div>
  </HOCLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import VModalBridgeDeposit from '~/components/partials/modals/bridge-deposit/index.vue'
import VModalBridgeWithdraw from '~/components/partials/modals/bridge-withdraw/index.vue'
import VModalSubaccountDeposit from '~/components/partials/modals/subaccount-deposit/index.vue'
import VModalSubaccountWithdraw from '~/components/partials/modals/subaccount-withdraw/index.vue'
import VBalances from '~/components/partials/common/balances/index.vue'
import VTrading from '~/components/partials/derivatives/trading/index.vue'
import VMarketChart from '~/components/partials/common/market/chart.vue'
import VMarket from '~/components/partials/derivatives/market.vue'
import VOrders from '~/components/partials/derivatives/orders.vue'
import VOrderbook from '~/components/partials/derivatives/orderbook.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    HOCLoading,
    VModalAddMargin,
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

      return params.derivative
    },

    marketFromRoute(): UiDerivativeMarket | undefined {
      const { markets, slugFromRoute } = this

      return markets.find(
        (m) => m.slug.toLowerCase() === slugFromRoute.toLowerCase()
      )
    },

    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    }
  },

  mounted() {
    this.$accessor.derivatives
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
    this.$accessor.derivatives.reset()
    clearInterval(this.interval)
  },

  methods: {
    //
  }
})
</script>
