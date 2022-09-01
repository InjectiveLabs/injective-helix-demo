<template>
  <HocLoading :status="status" :show-loading="markets.length === 0">
    <div class="bg-white rounded-lg pt-6 w-full self-center">
      <div v-if="isHero">
        <HeroMarketHeader v-if="markets.length !== 0" />
        <HeroMarketRow
          v-for="({ market, summary }, index) in heroMarketsList"
          :key="`hero-market-${market.marketId}-${index}`"
          :market="market"
          :summary="summary"
          :class="{
            'block border-b border-helixGray-200':
              index !== marketsList.length - 1
          }"
        />
      </div>
      <div v-else class="overflow-auto">
        <MarketHeader />
        <MarketRow
          v-for="({ market, summary }, index) in marketsList"
          :key="`market-${market.marketId}-${index}`"
          :market="market"
          :summary="summary"
          :class="{
            'block border-b border-helixGray-200':
              index !== marketsList.length - 1
          }"
        />
      </div>
    </div>
  </HocLoading>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiMarketHistory,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import MarketHeader from '~/components/partials/home/markets/market-header.vue'
import HeroMarketHeader from '~/components/partials/home//hero/hero-market-header.vue'
import HeroMarketRow from '~/components/partials/home//hero/hero-market-row.vue'
import MarketRow from '~/components/partials/home/markets/market-row.vue'
import {
  deprecatedMarkets,
  newMarketsSlug,
  upcomingMarkets
} from '~/app/data/market'
import { MarketFilterType, UiMarketAndSummary } from '~/types'

export default Vue.extend({
  components: {
    HeroMarketHeader,
    HeroMarketRow,
    MarketHeader,
    MarketRow
  },

  props: {
    filterType: {
      type: String as PropType<MarketFilterType>,
      default: MarketFilterType.Volume
    },

    limit: {
      type: Number,
      default: 3
    },

    isHero: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
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

    upcomingMarkets(): Array<
      UiSpotMarketWithToken | UiDerivativeMarketWithToken
    > {
      return this.$accessor.exchange.upcomingMarkets
    },

    upcomingMarketSummaries(): Array<
      UiSpotMarketSummary | UiDerivativeMarketSummary
    > {
      return this.$accessor.exchange.upcomingMarketsSummaries
    },

    marketsHistory(): UiMarketHistory[] {
      return this.$accessor.exchange.marketsHistory
    },

    markets(): Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken> {
      const { spotMarkets, derivativeMarkets, upcomingMarkets } = this

      return [...derivativeMarkets, ...spotMarkets, ...upcomingMarkets]
    },

    marketsSummary(): Array<UiSpotMarketSummary | UiDerivativeMarketSummary> {
      const {
        spotMarketsSummary,
        derivativeMarketsSummary,
        upcomingMarketSummaries
      } = this

      return [
        ...derivativeMarketsSummary,
        ...spotMarketsSummary,
        ...upcomingMarketSummaries
      ]
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

    upcomingMarketsSlugs(): string[] {
      return upcomingMarkets.map((market) => market.slug)
    },

    deprecatedMarketsSlugs(): string[] {
      return deprecatedMarkets.map((market) => market.slug)
    },

    filteredMarkets(): UiMarketAndSummary[] {
      const { mappedMarkets, upcomingMarketsSlugs, deprecatedMarketsSlugs } =
        this

      return mappedMarkets.filter(
        (m) =>
          !upcomingMarketsSlugs.includes(m.market.slug) &&
          !deprecatedMarketsSlugs.includes(m.market.slug)
      )
    },

    filteredUpcomingMarkets(): UiMarketAndSummary[] {
      const { mappedMarkets, upcomingMarketsSlugs } = this

      return mappedMarkets.filter((m) =>
        upcomingMarketsSlugs.includes(m.market.slug)
      )
    },

    marketsSortedByVolume(): UiMarketAndSummary[] {
      const { filteredMarkets } = this

      return filteredMarkets.sort((marketA, marketB) => {
        const aVolume = marketA.summary.volume
        const bVolume = marketB.summary.volume

        return new BigNumberInBase(bVolume).minus(aVolume).toNumber()
      })
    },

    newMarketsList(): UiMarketAndSummary[] {
      const { mappedMarkets } = this

      return mappedMarkets
        .filter(({ market: { slug } }) => {
          return newMarketsSlug.includes(slug.toLowerCase())
        })
        .sort(
          (a, b) =>
            newMarketsSlug.indexOf(a.market.slug) -
            newMarketsSlug.indexOf(b.market.slug)
        )
    },

    filteredMarketsList(): UiMarketAndSummary[] {
      const {
        filteredMarkets,
        marketsSortedByVolume,
        newMarketsList,
        filterType
      } = this

      if (filterType === MarketFilterType.New) {
        return newMarketsList
      }

      if (filterType === MarketFilterType.Volume) {
        return marketsSortedByVolume
      }

      return filteredMarkets
    },

    marketsList(): UiMarketAndSummary[] {
      const { filteredMarketsList, limit } = this

      return filteredMarketsList.slice(0, limit)
    },

    heroMarketsList(): UiMarketAndSummary[] {
      const { marketsList, newMarketsList } = this

      const [latestMarket, secondLatestMarket] = newMarketsList

      if (!latestMarket) {
        return marketsList
      }

      return secondLatestMarket
        ? [...marketsList, latestMarket, secondLatestMarket]
        : [...marketsList, latestMarket]
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

<style lang="scss" scoped>
*::-webkit-scrollbar-thumb {
  background-color: #d9dadc;
  border-radius: 20px;
  border: 2px solid #d9dadc;
}

*::-webkit-scrollbar-track {
  background: #fff;
}
</style>
