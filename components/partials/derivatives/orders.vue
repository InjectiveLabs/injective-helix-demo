<template>
  <v-panel>
    <div slot="context">
      <div class="flex items-center justify-between">
        <div class="tabs">
          <ul role="tablist" class="tablist">
            <li
              role="tab"
              :aria-selected="component === components.openOrders"
              class="tab"
              @click.stop.prevent="onSelect(components.openOrders)"
            >
              <span>{{ $t('open_orders') }} {{ `(${orders.length})` }}</span>
            </li>
            <li
              role="tab"
              :aria-selected="component === components.tradeHistory"
              class="tab"
              @click.stop.prevent="onSelect(components.tradeHistory)"
            >
              <span>{{ $t('trade_history') }}</span>
            </li>
          </ul>
        </div>
        <v-ui-button
          v-if="component === components.openOrders"
          xs
          primary
          class="mr-4"
          @click.stop="handleCancelAllClick"
        >
          {{ $t('cancel_all') }}
        </v-ui-button>
      </div>
    </div>
    <component
      :is="currentComponent"
      transition="slide-content"
      transition-mode="out-in"
    ></component>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'
import { UiDerivativeLimitOrder } from '~/types'

const components = {
  openOrders: 0,
  orderHistory: 1,
  tradeHistory: 2
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
    },

    currentComponent(): string {
      const { component } = this

      switch (component) {
        case components.openOrders:
          return 'v-open-orders'
        case components.tradeHistory:
          return 'v-trade-history'
        default:
          return 'v-open-orders'
      }
    }
  },

  methods: {
    onSelect(component: number) {
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
