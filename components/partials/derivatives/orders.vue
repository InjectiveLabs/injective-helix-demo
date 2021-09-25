<template>
  <div class="flex-1">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <v-button
          :class="{
            'text-gray-500': component === components.tradeHistory
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.openOrders)"
        >
          <span>{{ $t('open_orders') }} {{ `(${orders.length})` }}</span>
        </v-button>
        <div class="mx-2 w-px h-4 bg-dark-500"></div>
        <v-button
          :class="{
            'text-gray-500': component === components.openOrders
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.tradeHistory)"
        >
          <span>{{ $t('trade_history') }}</span>
        </v-button>
      </div>

      <v-button
        v-if="component === components.openOrders && orders.length > 0"
        text-xs
        @click.stop="handleCancelAllClick"
      >
        {{ $t('cancel_all') }}
      </v-button>
    </div>

    <div class="bg-gray-900 px-4 py-2 rounded-lg mt-2">
      <component :is="component" v-if="component"></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'
import { UiDerivativeLimitOrder } from '~/types'

const components = {
  orderHistory: '',
  openOrders: 'v-open-orders',
  tradeHistory: 'v-trade-history'
}

export default Vue.extend({
  components: {
    'v-trade-history': TradeHistory,
    'v-open-orders': OpenOrders
  },

  data() {
    return {
      components,
      component: components.openOrders
    }
  },

  computed: {
    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    handleCancelAllClick() {
      const { orders } = this

      this.$accessor.derivatives
        .batchCancelOrder(orders)
        .then(() => {
          this.$toast.success(this.$t('orders_cancelled'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          //
        })
    }
  }
})
</script>
