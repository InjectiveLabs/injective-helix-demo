<template>
  <div v-if="market" class="h-full">
    <div
      v-if="orders.length > 0 && isUserWalletConnected"
      class="table-responsive min-h-orders max-h-lg"
    >
      <table class="table">
        <orders-table-header />
        <tbody>
          <tr
            is="v-order"
            v-for="(order, index) in orders"
            :key="`orders-${index}-${order.orderHash}`"
            :order="order"
          ></tr>
        </tbody>
      </table>
    </div>
    <v-user-wallet-connect-warning
      v-else-if="!isUserWalletConnected"
      class="bg-gray-900 mt-2"
    />
    <v-empty-list v-else :message="$t('trade.emptyOrders')" />
  </div>
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

  data() {
    return {
      limit: 9
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    orders(): UiDerivativeLimitOrder[] {
      const { market } = this

      if (!market) {
        return []
      }

      return this.$accessor.derivatives.subaccountOrders
    }
  }
})
</script>
