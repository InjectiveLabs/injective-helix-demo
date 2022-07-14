<template>
  <VCard class="relative h-full" md>
    <HocLoading :status="status" :show-loading="mappedMarkets.length === 0">
      <MarketsTable :markets="mappedMarkets" />
    </HocLoading>
  </VCard>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { UiMarketAndSummaryWithVolumeInUsd, TokenUsdPriceMap } from '~/types'
import {
  ETH_COIN_GECKO_ID,
  USDT_COIN_GECKO_ID,
  UST_COIN_GECKO_ID
} from '~/app/utils/constants'
import MarketsTable from '~/components/partials/common/market-selection/markets-table.vue'

export default Vue.extend({
  components: {
    MarketsTable
  },

  data() {
    return {
      activeType: '',
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

    tokenUsdPriceMap(): TokenUsdPriceMap {
      return this.$accessor.token.tokenUsdPriceMap
    },

    markets(): Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken> {
      const { spotMarkets, derivativeMarkets } = this

      return [...derivativeMarkets, ...spotMarkets]
    },

    marketsSummary(): Array<UiSpotMarketSummary | UiDerivativeMarketSummary> {
      const { spotMarketsSummary, derivativeMarketsSummary } = this

      return [...derivativeMarketsSummary, ...spotMarketsSummary]
    },

    mappedMarkets(): UiMarketAndSummaryWithVolumeInUsd[] {
      const { markets, marketsSummary, tokenUsdPriceMap } = this

      return markets
        .map((market) => {
          const summary = marketsSummary.find(
            (summary) => summary.marketId === market.marketId
          )
          const quoteTokenUsdPrice = new BigNumberInBase(
            tokenUsdPriceMap[market.quoteToken.coinGeckoId]
          )
          const volumeInUsd = quoteTokenUsdPrice.multipliedBy(
            summary?.volume || '0'
          )

          return {
            market,
            volumeInUsd,
            summary
          }
        })
        .filter(
          ({ summary, volumeInUsd }) =>
            summary !== undefined &&
            !volumeInUsd.isNaN() &&
            volumeInUsd.isFinite()
        ) as UiMarketAndSummaryWithVolumeInUsd[]
    }
  },

  mounted() {
    this.setMarketSummariesPolling()
  },

  methods: {
    getMarketSummariesAndQuoteTokenPrice(): Promise<void[]> {
      return Promise.all([
        this.$accessor.token.getTokenUsdPriceMap([
          ETH_COIN_GECKO_ID,
          USDT_COIN_GECKO_ID,
          UST_COIN_GECKO_ID
        ]),
        this.$accessor.app.pollMarkets()
      ])
    },

    setMarketSummariesPolling() {
      this.getMarketSummariesAndQuoteTokenPrice()
        .then(() => {
          this.interval = setInterval(async () => {
            await this.getMarketSummariesAndQuoteTokenPrice()
          }, 1000 * 10)
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
