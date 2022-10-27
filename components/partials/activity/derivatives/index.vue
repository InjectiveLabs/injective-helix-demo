<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-4 overflow-x-auto hide-scrollbar">
      <TabSelectorItem
        v-model="component"
        data-cy="activity-derivative-orders-link"
        :option="components.orders"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.openOrders') }}
          </span>
          <span data-cy="activity-derivative-orders-link-count">
            ({{ totalOrderCount }})
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
          <span class="whitespace-nowrap">
            {{ $t('activity.triggers') }}
          </span>
          <span data-cy="activity-derivative-orders-link-count">
            ({{ totalTriggerCount }})
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
          <span class="whitespace-nowrap">
            {{ $t('activity.orderHistory') }}
          </span>
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-derivative-trade-history-link"
        :option="components.trades"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.tradeHistory') }}
          </span>
        </div>
      </TabSelectorItem>
    </div>

    <VCard md class="h-full mt-4 xs:mt-6 relative">
      <Orders v-show="component === components.orders" />
      <Trades v-if="component === components.trades" />
      <Triggers v-if="component === components.triggers" />
      <OrderHistory v-if="component === components.orderHistory" />
    </VCard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
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
    totalOrderCount(): number {
      return this.$accessor.derivatives.subaccountOrdersPagination.total
    },

    totalTriggerCount(): number {
      return this.$accessor.derivatives.subaccountConditionalOrdersPagination
        .total
    }
  },

  mounted() {
    this.$accessor.derivatives.streamSubaccountOrders()
    this.$accessor.derivatives.streamSubaccountOrderHistory()
    this.$accessor.derivatives.streamTrades()
  },

  methods: {}
})
</script>
