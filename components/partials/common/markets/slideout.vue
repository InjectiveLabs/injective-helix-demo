<template>
  <v-slideout
    :is-open="isSlideoutOpen"
    :show-header="showHeader"
    @slideout-closed="closeSlideout"
  >
    <div>
      <v-table :markets="markets" :summaries="marketsSummary" simple />
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
import VTable from './table.vue'
import VSlideout from '~/components/elements/slideout.vue'

export default Vue.extend({
  components: {
    VTable,
    VSlideout
  },

  data() {
    return {
      showHeader: true,
      isSlideoutOpen: false
    }
  },

  computed: {
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
