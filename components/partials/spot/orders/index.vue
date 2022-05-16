<template>
  <div v-if="market">
    <!-- mobile table -->
    <TableBody
      :show-empty="filteredOrders.length === 0"
      class="sm:hidden pt-0 bg-gray-1050"
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
        class="mt-6 min-h-orders"
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
  UiSpotLimitOrder,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'
import MobileOrder from '~/components/partials/common/spot/mobile-order.vue'
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
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    orders(): UiSpotLimitOrder[] {
      const { market } = this

      if (!market) {
        return []
      }

      return this.$accessor.spot.subaccountOrders
    },

    filteredOrders(): UiSpotLimitOrder[] {
      const { currentMarketOnly, market, orders } = this

      if (!currentMarketOnly) {
        return orders
      }

      return orders.filter((order) => order.marketId === market?.marketId)
    }
  }
})
</script>
