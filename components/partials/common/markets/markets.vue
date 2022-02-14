<template>
  <div class="relative">
    <HOCLoading :status="status">
      <v-table :markets="markets" :summaries="marketsSummary" />
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { Status, StatusType } from '@injectivelabs/utils'
import VTable from './table.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    VTable,
    HOCLoading
  },

  computed: {
    marketsLoadingState(): StatusType {
      return this.$accessor.app.marketsLoadingState
    },

    status(): Status {
      const { marketsLoadingState } = this

      return new Status(marketsLoadingState)
    },

    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    derivativeMarketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    spotMarketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    markets(): Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken> {
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
