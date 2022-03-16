<template>
  <v-slideout
    :is-open="isSlideoutOpen"
    :show-header="showHeader"
    @slideout-closed="closeSlideout"
  >
    <div class="relative">
      <VHocLoading :status="status" :show-loading="markets.length === 0">
        <v-table
          :markets="markets"
          :summaries="marketsSummary"
          simple
          show-all
        />
      </VHocLoading>
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

export default Vue.extend({
  components: {
    VTable,
    VSlideout
  },

  data() {
    return {
      showHeader: true,
      isSlideoutOpen: false,

      interval: 0 as any
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

  watch: {
    isSlideoutOpen(isSlideoutOpen: boolean) {
      if (isSlideoutOpen && this.$route.name === 'index') {
        this.setMarketSummariesPolling()
      } else {
        clearInterval(this.interval)
      }
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
    setMarketSummariesPolling() {
      this.$accessor.app.setMarketsLoadingState(StatusType.Loading)

      Promise.all([this.$accessor.app.pollMarkets()])
        .then(() => {
          this.interval = setInterval(async () => {
            await this.$accessor.app.pollMarkets()
          }, 5000)
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.$accessor.app.setMarketsLoadingState(StatusType.Idle)
        })
    },

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
