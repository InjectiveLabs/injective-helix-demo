<template>
  <div v-if="market" class="h-full">
    <!-- mobile table -->
    <TableBody
      :show-empty="orders.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <MobileOrder
        v-for="(order, index) in orders"
        :key="`mobile-order-${index}-${order.orderHash}`"
        class="col-span-1"
        :order="order"
      />

      <EmptyList
        slot="empty"
        :message="$t('trade.emptyOrders')"
        class="min-h-orders"
      />
    </TableBody>

    <TableWrapper class="hidden sm:block">
      <table v-if="orders.length > 0" class="table">
        <OrdersTableHeader />
        <tbody>
          <tr
            is="v-order"
            v-for="(order, index) in orders"
            :key="`orders-${index}-${order.orderHash}`"
            :order="order"
          ></tr>
        </tbody>
      </table>
      <EmptyList v-else :message="$t('trade.emptyOrders')" />
    </TableWrapper>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotLimitOrder,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import MobileOrder from '~/components/partials/common/spot/mobile-order.vue'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'
import TableBody from '~/components/elements/table-body.vue'

export default Vue.extend({
  components: {
    'v-order': Order,
    MobileOrder,
    OrdersTableHeader,
    TableBody
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
    }
  }
})
</script>
