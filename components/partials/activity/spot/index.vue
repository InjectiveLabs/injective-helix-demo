<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-4">
      <TabSelectorItem
        v-model="component"
        data-cy="activity-spot-orders-link"
        :option="components.orders"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.openOrders') }}</span>
          <portal-target
            name="activity-tab-spot-count"
            data-cy="activity-spot-orders-link-count"
          />
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-spot-triggers-link"
        :option="components.triggers"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.triggers') }}</span>
          <!-- <portal-target
            name="activity-tab-spot-triggers-count"
            data-cy="activity-spot-orders-link-count"
          /> -->
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-spot-order-history-link"
        :option="components.orderHistory"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.orderHistory') }}</span>
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-spot-trades-link"
        :option="components.trades"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.tradeHistory') }}</span>
        </div>
      </TabSelectorItem>
    </div>
    <VCard md class="h-full mt-6">
      <Orders v-show="component === components.orders" />
      <OrderHistory v-if="component === components.orderHistory" />
      <Triggers v-if="component === components.triggers" />
      <Trades v-if="component === components.trades" />
    </VCard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Orders from '~/components/partials/activity/spot/orders.vue'
import OrderHistory from '~/components/partials/activity/spot/order-history.vue'
import Triggers from '~/components/partials/activity/spot/triggers.vue'
import Trades from '~/components/partials/activity/spot/trades.vue'
import TabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  orders: 'orders',
  trades: 'trades',
  triggers: 'triggers',
  orderHistory: 'order-history'
}

export default Vue.extend({
  components: {
    Trades,
    Orders,
    OrderHistory,
    Triggers,
    TabSelectorItem
  },

  data() {
    return {
      components,
      component: components.orders
    }
  },

  mounted() {
    this.$accessor.spot.streamSubaccountOrders()
    this.$accessor.spot.streamSubaccountTrades()
  }
})
</script>
