<template>
  <v-card-table-wrap>
    <template #actions>
      <div class="col-span-12 sm:col-span-6 m-4 lg:mx-0">
        <div class="flex items-center justify-between sm:justify-start">
          <v-button-filter v-model="component" :option="components.openOrders">
            <span class="uppercase text-xs font-semibold">
              {{ $t('trade.open_orders') }}
              {{ `(${filteredOrders.length})` }}
            </span>
          </v-button-filter>
          <v-separator />
          <v-button-filter
            v-model="component"
            :option="components.tradeHistory"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('trade.trade_history') }}
            </span>
          </v-button-filter>
        </div>
      </div>

      <div
        class="col-span-12 sm:col-span-6 mb-4 mx-4 sm:mt-4 flex items-center justify-between sm:justify-end"
      >
        <v-checkbox v-if="market" v-model="currentMarketOnly" class="mr-4">
          {{ $t('trade.asset_only', { asset: market.ticker }) }}
        </v-checkbox>
        <v-button
          v-if="
            component === components.openOrders && filteredOrders.length > 0
          "
          class="mr-2"
          red-outline
          sm
          @click.stop="handleCancelAllClick"
        >
          {{ $t('trade.cancelAllOrders') }}
        </v-button>
      </div>
    </template>

    <VHocLoading :status="status">
      <v-card class="h-full">
        <component
          :is="component"
          v-if="component"
          v-bind="{ currentMarketOnly }"
        ></component>
      </v-card>
    </VHocLoading>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotLimitOrder,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { Status, StatusType } from '@injectivelabs/utils'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'

const components = {
  orderHistory: '',
  openOrders: 'v-open-orders',
  tradeHistory: 'v-trade-history'
}

export default Vue.extend({
  components: {
    'v-trade-history': TradeHistory,
    'v-open-orders': OpenOrders
  },

  data() {
    return {
      currentMarketOnly: false,
      status: new Status(StatusType.Loading),

      components,
      component: components.openOrders
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    orders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    },

    currentMarketOrders(): UiSpotLimitOrder[] {
      const { market, orders } = this

      return orders.filter((order) => order.marketId === market?.marketId)
    },

    filteredOrders(): UiSpotLimitOrder[] {
      const { currentMarketOnly, orders, currentMarketOrders } = this

      return currentMarketOnly ? currentMarketOrders : orders
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.spot.fetchSubaccountOrders(),
      this.$accessor.spot.fetchSubaccountTrades()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    cancelOrder(): Promise<void> {
      const { filteredOrders } = this

      const [order] = filteredOrders

      return this.$accessor.spot.cancelOrder(order)
    },

    cancelAllOrders(): Promise<void> {
      const { filteredOrders } = this

      return this.$accessor.spot.batchCancelOrder(filteredOrders)
    },

    handleCancelAllClick() {
      const { filteredOrders } = this

      const action =
        filteredOrders.length === 1 ? this.cancelOrder : this.cancelAllOrders

      action()
        .then(() => {
          this.$toast.success(this.$t('trade.orders_cancelled'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          //
        })
    }
  }
})
</script>
