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
              {{ `(${orders.length})` }}
            </span>
          </VButtonFilter>

          <VSeparator />

          <!-- <VButtonFilter
            v-model="component"
            :option="components.triggers"
            data-cy="trading-page-triggers-tab-button"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('activity.triggers') }}
              {{ `(${triggers.length})` }}
            </span>
          </VButtonFilter> -->

          <!-- <VSeparator /> -->

          <VButtonFilter
            v-model="component"
            :option="components.orderHistory"
            data-cy="trading-page-order-history-tab-button"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('activity.orderHistory') }}
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
        <VCheckbox
          v-if="market"
          v-model="currentMarketOnly"
          data-cy="trade-page-filter-by-ticker-checkbox"
          class="lg:mr-4"
        >
          {{ $t('trade.asset_only', { asset: market.ticker }) }}
        </VCheckbox>
        <VButton
          v-if="component === components.openOrders && orders.length > 0"
          class="mr-2 rounded"
          red-outline
          sm
          data-cy="trade-page-cancel-all-button"
          @click.stop="handleCancelAllClick"
        >
          {{ $t('trade.cancelAllOrders') }}
        </VButton>
      </div>
    </template>

    <HocLoading :status="status">
      <VCard class="h-full">
        <component :is="component" v-if="component"></component>
      </VCard>
    </HocLoading>
  </VCardTableWrap>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotLimitOrder,
  UiSpotMarketWithToken,
  UiSpotOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import OpenOrders from './orders/index.vue'
// import Triggers from './triggers/index.vue'
import OrderHistory from './order-history/index.vue'
import TradeHistory from './trade-history/index.vue'

const components = {
  openOrders: 'openOrders',
  // triggers: 'triggers',
  orderHistory: 'orderHistory',
  tradeHistory: 'TradeHistory'
}

export default Vue.extend({
  components: {
    OpenOrders,
    // Triggers,
    OrderHistory,
    TradeHistory
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

    orderHistory(): UiSpotOrderHistory[] {
      return this.$accessor.spot.subaccountOrderHistory
    },

    // triggers(): UiSpotOrderHistory[] {
    //   return this.$accessor.spot.subaccountConditionalOrders
    // },

    currentMarketOrders(): UiSpotLimitOrder[] {
      const { market, orders } = this

      return orders.filter((order) => order.marketId === market?.marketId)
    }
  },

  watch: {
    currentMarketOnly: {
      handler() {
        this.fetchAll()
      },
      immediate: true
    }
  },

  mounted() {
    this.fetchAll().catch(this.$onError)
  },

  methods: {
    fetchAll(): Promise<void> {
      return new Promise((resolve, reject) => {
        const { currentMarketOnly, market } = this

        this.status.setLoading()

        const fetchOptions = {
          filters: {
            marketId: currentMarketOnly && market ? market.marketId : undefined
          },
          pagination: {
            endTime: 0
          }
        }

        Promise.all([
          this.$accessor.spot.fetchSubaccountOrders(fetchOptions),
          this.$accessor.spot.fetchSubaccountOrderHistory(fetchOptions),
          // this.$accessor.spot.fetchSubaccountConditionalOrders(fetchOptions),
          this.$accessor.spot.fetchSubaccountTrades(fetchOptions)
        ])
          .then(() => {
            //
          })
          .catch(reject)
          .finally(() => {
            this.status.setIdle()
            resolve()
          })
      })
    },

    onSelect(component: string) {
      this.component = component
    },

    cancelOrder(): Promise<void> {
      const { orders } = this

      const [order] = orders

      return this.$accessor.spot.cancelOrder(order)
    },

    cancelAllOrders(): Promise<void> {
      const { orders } = this

      return this.$accessor.spot.batchCancelOrder(orders)
    },

    handleCancelAllClick() {
      const { orders } = this

      const action =
        orders.length === 1 ? this.cancelOrder : this.cancelAllOrders

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
