<template>
  <div class="table-compact">
    <div class="table-responsive">
      <table class="table">
        <tbody>
          <tr
            is="v-derivative"
            v-for="({ market, summary }, index) in mappedMarkets"
            :key="`derivative-markets-${market.ticker}-${index}`"
            v-bind="{ market, marketSummary: summary }"
            @selected="$emit('selected')"
          ></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Derivative from './derivative-mobile.vue'
import {
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  UiDerivativeMarketAndSummary
} from '~/types'

export default Vue.extend({
  components: {
    'v-derivative': Derivative
  },

  computed: {
    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    marketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    },

    mappedMarkets(): UiDerivativeMarketAndSummary[] {
      const { markets, marketsSummary } = this

      return markets
        .map((market) => {
          return {
            market,
            summary: marketsSummary.find(
              (summary) => summary.marketId === market.marketId
            )
          }
        })
        .filter(
          ({ summary }) => summary !== undefined
        ) as UiDerivativeMarketAndSummary[]
    }
  }
})
</script>
