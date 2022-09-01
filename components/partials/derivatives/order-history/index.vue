<template>
  <div v-if="market" class="h-full">
    <TableWrapper class="hidden sm:block">
      <table v-if="filteredOrders.length > 0" class="table">
        <OrderHistoryTableHeader />
        <tbody>
          <tr
            is="OrderHistory"
            v-for="(order, index) in filteredOrders"
            :key="`order-history-${index}`"
            :order="order"
          />
        </tbody>
      </table>
      <EmptyList v-else :message="$t('trade.emptyOrders')" />
    </TableWrapper>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import OrderHistory from '~/components/partials/common/derivatives/order-history.vue'
import OrderHistoryTableHeader from '~/components/partials/common/derivatives/order-history-table-header.vue'

export default Vue.extend({
  components: {
    OrderHistory,
    OrderHistoryTableHeader
  },

  props: {
    currentMarketOnly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {}
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    orders(): UiDerivativeOrderHistory[] {
      return this.$accessor.derivatives.subaccountOrderHistory
    },

    filteredOrders(): UiDerivativeOrderHistory[] {
      const { orders, currentMarketOnly, market } = this

      if (!currentMarketOnly || !market) {
        return orders
      }

      return orders.filter(
        (order: UiDerivativeOrderHistory) => order.marketId === market.marketId
      )
    }
  }
})
</script>
