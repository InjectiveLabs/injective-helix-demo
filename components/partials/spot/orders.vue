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
          v-if="component === components.openOrders && orders.length > 0"
          xs
          primary
          text
          class="mr-4"
          @click.stop="handleCancelAllClick"
        >
          {{ $t('cancel_all') }}
        </v-ui-button>
      </div>
    </div>
    <component :is="component" v-if="component"></component>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'
import { UiSpotLimitOrder } from '~/types'

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
