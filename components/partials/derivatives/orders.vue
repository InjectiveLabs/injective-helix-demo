<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter v-model="component" :option="components.openOrders">
        <span>
          {{ $t('open_orders') }}
          {{ `(${orders.length})` }}
        </span>
      </v-button-filter>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button-filter v-model="component" :option="components.openPositions">
        <span>
          {{ $t('open_positions') }}
          <span v-if="position">(1)</span>
        </span>
      </v-button-filter>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
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
import OpenOrders from './orders/index.vue'
import OpenPositions from './positions/index.vue'
import TradeHistory from './trade-history/index.vue'
import { UiDerivativeLimitOrder, UiPosition } from '~/types'

const components = {
  orderHistory: '',
  openOrders: 'v-open-orders',
  openPositions: 'v-open-positions',
  tradeHistory: 'v-trade-history'
}

export default Vue.extend({
  components: {
    'v-trade-history': TradeHistory,
    'v-open-orders': OpenOrders,
    'v-open-positions': OpenPositions
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
    },

    position(): UiPosition | undefined {
      return this.$accessor.derivatives.subaccountPosition
    }
  },

  watch: {
    position(newPosition: UiPosition | undefined) {
      if (newPosition) {
        this.component = components.openPositions
      }
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
