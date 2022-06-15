<template>
  <VCardTableWrap>
    <template #actions>
      <div class="col-span-12 sm:col-span-6 m-4 lg:mx-0">
        <div class="flex items-center justify-between sm:justify-start">
          <VButtonFilter
            v-model="component"
            :option="components.openOrders"
            data-cy="trading-page-open-orders-tab-button"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('trade.open_orders') }}
              {{ `(${filteredOrders.length})` }}
            </span>
          </VButtonFilter>
          <VSeparator />
          <VButtonFilter
            v-model="component"
            :option="components.tradeHistory"
            data-cy="trading-page-trade-history-tab-button"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('trade.trade_history') }}
            </span>
          </VButtonFilter>
        </div>
      </div>

      <div
        class="col-span-12 sm:col-span-6 mb-4 mx-4 sm:mt-4 flex items-center justify-between sm:justify-end"
      >
        <VCheckbox v-if="market" v-model="currentMarketOnly" class="mr-4">
          {{ $t('trade.asset_only', { asset: market.ticker }) }}
        </VCheckbox>
        <VButton
          v-if="
            component === components.openOrders && filteredOrders.length > 0
          "
          class="mr-2"
          red-outline
          sm
          @click.stop="handleCancelAllClick"
        >
          {{ $t('trade.cancelAllOrders') }}
        </VButton>
      </div>
    </template>

    <HocLoading :status="status">
      <VCard class="h-full">
        <component
          :is="component"
          v-if="component"
          v-bind="{ currentMarketOnly }"
        ></component>
      </VCard>
    </HocLoading>
  </VCardTableWrap>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotLimitOrder,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'

const components = {
  orderHistory: '',
  openOrders: 'openOrders',
  tradeHistory: 'TradeHistory'
}

export default Vue.extend({
  components: {
    TradeHistory,
    OpenOrders
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
