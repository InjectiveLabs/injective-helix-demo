<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="w-full mx-auto">
      <div class="flex flex-wrap items-center justify-center">
        <v-button-select v-model="component" :option="components.orders" text>
          {{ $t('activities.openOrders') }}
        </v-button-select>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button-select v-model="component" :option="components.trades" text>
          {{ $t('activities.tradeHistory') }}
        </v-button-select>
      </div>
      <div class="mt-6 relative">
        <component :is="`v-${component}`"></component>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VOrders from '~/components/partials/activities/spot/orders.vue'
import VTrades from '~/components/partials/activities/spot/trades.vue'

const components = {
  orders: 'orders',
  trades: 'trades',
  ordersHistory: 'orders-history'
}

export default Vue.extend({
  components: {
    VOrders,
    VTrades
  },

  data() {
    return {
      components,
      component: components.orders
    }
  }
})
</script>
