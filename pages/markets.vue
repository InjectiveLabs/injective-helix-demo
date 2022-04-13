<template>
  <VHocLoading :status="status" :show-loading="mappedMarkets.length === 0">
    <div>
      <v-overview v-if="mappedMarkets.length > 0" :markets="mappedMarkets" />
      <v-markets :markets="mappedMarkets" />
    </div>
  </VHocLoading>
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
import VMarkets from '~/components/partials/markets/index.vue'
import VOverview from '~/components/partials/markets/overview.vue'
import { MarketFilterType, UiMarketAndSummary } from '~/types'

export default Vue.extend({
  components: {
    VMarkets,
    VOverview
  },

  data() {
    return {
      MarketFilterType,
      filterType: MarketFilterType.Volume,
      marketType: '' as string,
      marketBase: '' as string,
      search: '',
      status: new Status(StatusType.Loading),

      interval: 0 as any
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
    },

    mappedMarkets(): UiMarketAndSummary[] {
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
        .filter(({ summary }) => summary !== undefined) as UiMarketAndSummary[]
    },

    filteredAllMarkets(): UiMarketAndSummary[] {
      const { search, marketType, marketBase, mappedMarkets } = this

      const query = search.toLowerCase().trim()

      return mappedMarkets.filter(({ market, summary }) => {
        const { ticker, quoteDenom } = market

        const satisfiesSearchCondition =
          quoteDenom.toLowerCase().startsWith(query) ||
          ticker.toLowerCase().startsWith(query)
        const marketTypeCondition = marketType
          ? marketType === market.type
          : true
        const marketBaseCondition = !marketBase
          ? true
          : marketBase && market.subType
          ? marketBase === market.subType
          : false

        return (
          marketTypeCondition &&
          marketBaseCondition &&
          satisfiesSearchCondition &&
          market &&
          summary !== undefined
        )
      }) as UiMarketAndSummary[]
    }
  },

  mounted() {
    this.setMarketSummariesPolling()
  },

  beforeDestroy() {
    clearInterval(this.interval)
  },

  methods: {
    setMarketSummariesPolling() {
      Promise.all([this.$accessor.app.pollMarkets()])
        .then(() => {
          this.interval = setInterval(async () => {
            await this.$accessor.app.pollMarkets()
          }, 5000)
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
