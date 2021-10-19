<template>
  <div
    v-if="market"
    class="table-responsive min-h-orders max-h-xs lg:max-h-md 4xl:max-h-lg"
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
    <v-user-wallet-connect-warning v-if="!isUserWalletConnected" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'
import { UiSpotMarket, UiSpotLimitOrder } from '~/types'

export default Vue.extend({
  components: {
    'v-order': Order,
    OrdersTableHeader
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiSpotMarket | undefined {
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
