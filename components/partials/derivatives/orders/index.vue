<template>
  <div v-if="market" class="h-full">
    <!-- mobile table -->
    <TableBody
      :show-empty="filteredOrders.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <mobile-order
        v-for="(order, index) in filteredOrders"
        :key="`mobile-order-${index}-${order.orderHash}`"
        class="col-span-1"
        :order="order"
      />

      <v-empty-list
        slot="empty"
        :message="$t('trade.emptyOrders')"
        class="min-h-orders"
      />
    </TableBody>

    <v-table-wrapper class="hidden sm:block">
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import MobileOrder from '~/components/partials/common/derivatives/mobile-order.vue'
import Order from '~/components/partials/common/derivatives/order.vue'
import OrdersTableHeader from '~/components/partials/common/derivatives/orders-table-header.vue'
import TableBody from '~/components/elements/table-body.vue'

export default Vue.extend({
  components: {
    'v-order': Order,
    MobileOrder,
    OrdersTableHeader,
    TableBody
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
