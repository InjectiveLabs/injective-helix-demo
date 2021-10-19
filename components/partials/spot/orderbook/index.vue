<template>
  <div>
    <v-table-head :market="market" />
    <v-orderbook />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import OrderBook from './order-book.vue'
import VTableHead from '~/components/partials/common/orderbook/table-head.vue'
import { UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-orderbook': OrderBook,
    VTableHead
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    }
  }
})
</script>
