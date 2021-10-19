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
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    VTableHead,
    'v-orderbook': OrderBook
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    }
  }
})
</script>
