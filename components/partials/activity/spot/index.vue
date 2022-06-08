<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-4">
      <v-tab-selector-item
        v-model="component"
        data-cy="activity-spot-orders-link"
        :option="components.orders"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.openOrders') }}</span>
          <portal-target name="activity-tab-spot-count" data-cy="activity-spot-orders-link-count" />
        </div>
      </v-tab-selector-item>

      <div class="w-px h-4 bg-gray-500" />

      <v-tab-selector-item
        v-model="component"
        data-cy="activity-spot-trades-link"
        :option="components.trades"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('activity.tradeHistory') }}</span>
        </div>
      </v-tab-selector-item>
    </div>
    <v-card md class="h-full mt-6">
      <v-orders v-show="component === components.orders" />
      <v-trades v-if="component === components.trades" />
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VOrders from '~/components/partials/activity/spot/orders.vue'
import VTrades from '~/components/partials/activity/spot/trades.vue'
import VTabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  orders: 'orders',
  trades: 'trades',
  ordersHistory: 'orders-history'
}

export default Vue.extend({
  components: {
    VOrders,
    VTrades,
    VTabSelectorItem
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
