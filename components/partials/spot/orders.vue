<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter v-model="component" :option="components.openOrders">
        <span>
          {{ $t('open_orders') }}
          {{ `(${orders.length})` }}
        </span>
      </v-button-filter>
      <v-separator />
      <v-button-filter v-model="component" :option="components.tradeHistory">
        <span>
          {{ $t('trade_history') }}
        </span>
      </v-button-filter>
    </template>
    <template #context>
      <v-button
        v-if="component === components.openOrders && orders.length > 0"
        text-xs
        @click.stop="handleCancelAllClick"
      >
        {{ $t('cancel_all') }}
      </v-button>
    </template>
    <component :is="component" v-if="component"></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotLimitOrder } from '@injectivelabs/ui-common'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'

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
    orders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    handleCancelAllClick() {
      const { orders } = this

      this.$accessor.spot
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
