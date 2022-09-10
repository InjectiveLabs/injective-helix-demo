<template>
  <div>
    <TableBody light :show-empty="markets.length === 0">
      <MarketExpiredRow
        v-for="(market, index) in markets"
        :key="`market-expired-row-${index}`"
        :market="market"
      />
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import MarketExpiredRow from '~/components/partials/markets/markets-expired/market-expired-row.vue'
import TableBody from '~/components/elements/table-body.vue'

export default Vue.extend({
  components: {
    TableBody,
    MarketExpiredRow
  },

  props: {
    markets: {
      type: Array as PropType<UiDerivativeMarketWithToken[]>,
      required: true
    }
  }
})
</script>
