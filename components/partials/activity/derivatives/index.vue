<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-center">
      <v-button-select v-model="component" :option="components.orders" text>
        {{ $t('activity.openOrders') }}
      </v-button-select>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button-select v-model="component" :option="components.trades" text>
        {{ $t('activity.tradeHistory') }}
      </v-button-select>
    </div>
    <v-card md class="h-full mt-6">
      <component :is="`v-${component}`"></component>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VOrders from '~/components/partials/activity/derivatives/orders.vue'
import VTrades from '~/components/partials/activity/derivatives/trades.vue'

const components = {
  orders: 'orders',
  trades: 'trades'
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
  },

  mounted() {
    this.$accessor.activity.streamSubaccountDerivativeOrders()
    this.$accessor.activity.streamSubaccountDerivativeTrades()
  },

  beforeDestroy() {
    this.$accessor.app.cancelAllStreams()
  }
})
</script>
