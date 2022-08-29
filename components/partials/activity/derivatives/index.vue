<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-4">
      <TabSelectorItem
        v-model="component"
        data-cy="activity-derivative-orders-link"
        :option="components.orders"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.openOrders') }}</span>
          <span data-cy="activity-derivative-orders-link-count">
            ({{ orders.length }})
          </span>
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-derivative-triggers-link"
        :option="components.triggers"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.triggers') }}</span>
          <span data-cy="activity-derivative-orders-link-count">
            ({{ triggers.length }})
          </span>
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-derivative-order-history-link"
        :option="components.orderHistory"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.orderHistory') }}</span>
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-derivative-trade-history-link"
        :option="components.trades"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.tradeHistory') }}</span>
        </div>
      </TabSelectorItem>
    </div>

    <portal to="activity-card-derivative-order-count">
      <span class="font-semibold text-sm md:text-lg">
        {{ orders.length }}
      </span>
    </portal>

    <VCard md class="h-full mt-6">
      <Orders v-show="component === components.orders" />
      <Trades v-if="component === components.trades" />
      <Triggers v-if="component === components.triggers" />
      <OrderHistory v-if="component === components.orderHistory" />
    </VCard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeLimitOrder, UiDerivativeOrderHistory } from '@injectivelabs/sdk-ui-ts'
import Orders from '~/components/partials/activity/derivatives/orders.vue'
import Trades from '~/components/partials/activity/derivatives/trades.vue'
import OrderHistory from '~/components/partials/activity/derivatives/order-history.vue'
import Triggers from '~/components/partials/activity/derivatives/triggers.vue'
import TabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  orders: 'orders',
  trades: 'trades',
  orderHistory: 'orderHistory',
  triggers: 'triggers'
}

export default Vue.extend({
  components: {
    Orders,
    Trades,
    Triggers,
    OrderHistory,
    TabSelectorItem
  },

  data() {
    return {
      components,
      component: components.orders
    }
  },

  computed: {
    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    triggers(): UiDerivativeOrderHistory[] {
      return this.$accessor.derivatives.subaccountConditionalOrders
    }
  },

  mounted() {
    this.$accessor.derivatives.streamSubaccountOrders()
    this.$accessor.derivatives.streamTrades()
  }
})
</script>
