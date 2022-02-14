<template>
  <div>
    <v-table-head :market="market" />
    <v-orderbook :aggregation="$attrs.aggregation" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/ui-common'
import OrderBook from './order-book.vue'
import VTableHead from '~/components/partials/common/orderbook/table-head.vue'

export default Vue.extend({
  components: {
    VTableHead,
    'v-orderbook': OrderBook
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    }
  }
})
</script>
