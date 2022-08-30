<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-4 overflow-x-auto hide-scrollbar">
      <TabSelectorItem
        v-model="component"
        data-cy="activity-spot-orders-link"
        :option="components.orders"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.openOrders') }}
          </span>
          <span data-cy="activity-spot-orders-link-count">
            ({{ orders.length }})
          </span>
        </div>
      </TabSelectorItem>

      <!-- <div class="w-px h-4 bg-gray-500" /> -->

      <!-- <TabSelectorItem
        v-model="component"
        data-cy="activity-spot-triggers-link"
        :option="components.triggers"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.triggers') }}
          </span>
          <span data-cy="activity-spot-orders-link-count">
            ({{ triggers.length }})
          </span>
        </div>
      </TabSelectorItem> -->

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="activity-spot-order-history-link"
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
        data-cy="activity-spot-trades-link"
        :option="components.trades"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.tradeHistory') }}
          </span>
        </div>
      </TabSelectorItem>
    </div>

    <portal to="activity-card-spot-count">
      <span class="font-semibold text-sm md:text-lg">
        {{ orders.length }}
      </span>
    </portal>

    <VCard md class="h-full mt-4 xs:mt-6">
      <Orders v-show="component === components.orders" />
      <OrderHistory v-if="component === components.orderHistory" />
      <!-- <Triggers v-if="component === components.triggers" /> -->
      <Trades v-if="component === components.trades" />
    </VCard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotLimitOrder } from '@injectivelabs/sdk-ui-ts'
import Orders from '~/components/partials/activity/spot/orders.vue'
import OrderHistory from '~/components/partials/activity/spot/order-history.vue'
// import Triggers from '~/components/partials/activity/spot/triggers.vue'
import Trades from '~/components/partials/activity/spot/trades.vue'
import TabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  orders: 'orders',
  trades: 'trades',
  // triggers: 'triggers',
  orderHistory: 'order-history'
}

export default Vue.extend({
  components: {
    Trades,
    Orders,
    OrderHistory,
    // Triggers,
    TabSelectorItem
  },

  data() {
    return {
      components,
      component: components.orders
    }
  },

  computed: {
    orders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    }

    // triggers(): UiSpotOrderHistory[] {
    //   return this.$accessor.spot.subaccountConditionalOrders
    // }
  },

  mounted() {
    this.$accessor.spot.streamSubaccountOrders()
    this.$accessor.spot.streamSubaccountTrades()
  }
})
</script>
