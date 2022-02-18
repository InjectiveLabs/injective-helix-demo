<template>
  <div v-if="market" class="h-full">
    <div
      v-if="orders.length > 0 && isUserWalletConnected"
      class="table-responsive min-h-orders max-h-lg"
    >
      <table class="table">
        <orders-table-header />
        <tbody v-if="isUserWalletConnected">
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
  UiSpotLimitOrder,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'

export default Vue.extend({
  components: {
    'v-order': Order,
    OrdersTableHeader
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

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
