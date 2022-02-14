<template>
  <v-slideout
    :is-open="isSlideoutOpen"
    :show-header="showHeader"
    @slideout-closed="closeSlideout"
  >
    <div class="relative">
      <HOCLoading :status="status">
        <v-table :markets="markets" :summaries="marketsSummary" simple />
      </HOCLoading>
    </div>
  </v-slideout>
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
import VSlideout from '~/components/elements/slideout.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    VTable,
    VSlideout,
    HOCLoading
  },

  data() {
    return {
      showHeader: true,
      isSlideoutOpen: false
    }
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
  },

  mounted() {
    this.$root.$on('toggle-market-slideout', this.toggleSlideout)
    this.$root.$on(
      'toggle-market-slideout-from-content',
      this.toggleSlideoutFromContent
    )
    this.$root.$on('close-market-slideout', this.closeSlideout)
  },

  methods: {
    toggleSlideout() {
      this.isSlideoutOpen = !this.isSlideoutOpen
      this.showHeader = true
    },

    toggleSlideoutFromContent() {
      this.isSlideoutOpen = !this.isSlideoutOpen
      this.showHeader = false
    },

    closeSlideout() {
      if (this.isSlideoutOpen) {
        this.isSlideoutOpen = false
      }
    }
  }
})
</script>
