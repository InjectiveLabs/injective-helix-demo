<template>
  <v-table-wrapper v-if="market">
    <table v-if="filteredOrders.length > 0" class="table">
      <orders-table-header />
      <tbody>
        <tr
          is="v-order"
          v-for="(order, index) in filteredOrders"
          :key="`orders-${index}-${order.orderHash}`"
          :order="order"
        ></tr>
      </tbody>
    </table>
    <v-empty-list v-else :message="$t('trade.emptyOrders')" />
  </v-table-wrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import Order from '~/components/partials/common/derivatives/order.vue'
import OrdersTableHeader from '~/components/partials/common/derivatives/orders-table-header.vue'

export default Vue.extend({
  components: {
    'v-order': Order,
    OrdersTableHeader
  },

  props: {
    currentMarketOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    orders(): UiDerivativeLimitOrder[] {
      const { market } = this

      if (!market) {
        return []
      }

      return this.$accessor.derivatives.subaccountOrders
    },

    filteredOrders(): UiDerivativeLimitOrder[] {
      const { currentMarketOnly, market, orders } = this

      if (!currentMarketOnly) {
        return orders
      }

      return orders.filter((order) => order.marketId === market?.marketId)
    }
  }
})
</script>
