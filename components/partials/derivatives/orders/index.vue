<template>
  <div v-if="market" class="table-responsive min-h-3xs">
    <table class="table">
      <thead>
        <tr>
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
          <th class="text-right">
            {{ $t('leverage') }}
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
import { UiDerivativeMarket, UiDerivativeLimitOrder } from '~/types'

export default Vue.extend({
  components: {
    'v-order': Order
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

    market(): UiDerivativeMarket | undefined {
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
