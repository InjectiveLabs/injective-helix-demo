<template>
  <div class="table-compact">
    <div class="table-responsive">
      <table class="table">
        <tbody>
          <tr
            is="v-spot"
            v-for="({ market, summary }, index) in mappedMarkets"
            :key="`spot-markets-${market.ticker}-${index}`"
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
import Spot from './spot-mobile.vue'
import {
  UiSpotMarket,
  UiSpotMarketSummary,
  UiSpotMarketAndSummary
} from '~/types'

export default Vue.extend({
  components: {
    'v-spot': Spot
  },

  computed: {
    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    marketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    mappedMarkets(): UiSpotMarketAndSummary[] {
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
        ) as UiSpotMarketAndSummary[]
    }
  }
})
</script>
