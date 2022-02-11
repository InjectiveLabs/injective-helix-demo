<template>
  <div>
    <v-table :markets="markets" :summaries="marketsSummary" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithTokenMeta,
  MarketType,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithTokenMeta
} from '@injectivelabs/ui-common'
import VTable from './table.vue'

export default Vue.extend({
  components: {
    VTable
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarketWithTokenMeta[] {
      return this.$accessor.derivatives.markets
    },

    derivativeMarketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    },

    spotMarkets(): UiSpotMarketWithTokenMeta[] {
      return this.$accessor.spot.markets
    },

    spotMarketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    markets(): Array<
      UiSpotMarketWithTokenMeta | UiDerivativeMarketWithTokenMeta
    > {
      const { spotMarkets, derivativeMarkets } = this

      return [...derivativeMarkets, ...spotMarkets]
    },

    marketsSummary(): Array<UiSpotMarketSummary | UiDerivativeMarketSummary> {
      const { spotMarketsSummary, derivativeMarketsSummary } = this

      return [...derivativeMarketsSummary, ...spotMarketsSummary]
    }
  }
})
</script>
