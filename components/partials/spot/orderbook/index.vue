<template>
  <div>
    <v-table-head :market="market" />
    <v-orderbook :aggregation="$attrs.aggregation" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/ui-common'
import OrderBook from './order-book.vue'
import VTableHead from '~/components/partials/common/orderbook/table-head.vue'

export default Vue.extend({
  components: {
    'v-orderbook': OrderBook,
    VTableHead
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    }
  }
})
</script>
