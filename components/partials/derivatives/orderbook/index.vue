<template>
  <div>
    <TableHead :market="market" />
    <Orderbook :aggregation="$attrs.aggregation" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import Orderbook from './order-book.vue'
import TableHead from '~/components/partials/common/orderbook/table-head.vue'

export default Vue.extend({
  components: {
    TableHead,
    Orderbook
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    }
  }
})
</script>
