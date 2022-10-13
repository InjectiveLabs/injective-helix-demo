<template>
  <div v-if="market" class="h-full">
    <TableWrapper class="hidden sm:block">
      <table v-if="orders.length > 0" class="table">
        <OrderHistoryTableHeader />
        <tbody>
          <tr
            is="OrderHistory"
            v-for="(order, index) in orders"
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

  data() {
    return {}
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    orders(): UiDerivativeOrderHistory[] {
      return this.$accessor.derivatives.subaccountOrderHistory
    }
  }
})
</script>
