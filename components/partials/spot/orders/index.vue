<template>
  <div v-if="market" class="table-responsive min-h-orders">
    <table class="table">
      <thead>
        <tr>
          <slot name="thead"></slot>
          <th class="text-right">
            {{ $t('price') }}
          </th>
          <th class="text-right">
            {{ $t('amount') }}
          </th>
          <th class="text-right">
            {{ $t('unfilled') }}
          </th>
          <th class="text-right">
            {{ $t('total') }}
          </th>
          <th class="text-center">
            {{ $t('side') }}
          </th>
          <th class="text-center">
            {{ $t('filled') }}
          </th>
          <th class="text-center">
            {{ $t('actions') }}
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
