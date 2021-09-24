<template>
  <div v-if="market" class="table-responsive min-h-3xs">
    <table class="table">
      <thead>
        <tr>
          <th class="text-right text-xs">
            <span>{{ $t('price') }}</span>
          </th>
          <th class="text-right text-xs">
            <span>{{ $t('amount') }}</span>
          </th>
          <th class="text-right text-xs">
            <span>{{ $t('unfilled') }}</span>
          </th>
          <th class="text-right text-xs">
            <span>{{ $t('total') }}</span>
          </th>
          <th class="text-center text-xs">
            <span>{{ $t('side') }}</span>
          </th>
          <th class="text-center text-xs">
            <span>{{ $t('filled') }}</span>
          </th>
          <th class="text-center text-xs">
            <span>{{ $t('actions') }}</span>
          </th>
        </tr>
      </thead>
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
import Order from './order.vue'
import { UiSpotMarket, UiSpotLimitOrder } from '~/types'

export default Vue.extend({
  components: {
    'v-order': Order
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
