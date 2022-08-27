<template>
  <HocLoading :status="status" :show-loading="markets.length === 0">
    <div class="bg-white rounded-lg pt-6 w-full self-center px-4">
      <div v-if="isHero">
        <HeroMarketHeader v-if="markets.length !== 0" />
        <HeroMarketRow
          v-for="({ market, summary }, index) in marketsList"
          :key="`market-${index}`"
          :market="market"
          :summary="summary"
        />
      </div>
      <div v-else class="overflow-auto">
        <MarketHeader />
        <MarketRow
          v-for="({ market, summary }, index) in marketsList"
          :key="`market-${index}`"
          :market="market"
          :summary="summary"
        />
        <MarketRow
          v-for="({ market, summary }, index) in filteredUpcomingMarkets"
          :key="`market-new-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
        />
        <MarketRow
          v-for="({ market, summary }, index) in filteredDeprecatedMarkets"
          :key="`market-deprecated-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
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
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import MarketHeader from '~/components/partials/home/markets/market-header.vue'
import HeroMarketHeader from '~/components/partials/home/markets/hero-market-header.vue'
import HeroMarketRow from '~/components/partials/home/markets/hero-market-row.vue'
import MarketRow from '~/components/partials/home/markets/market.vue'
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
      default: 5
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

    filteredDeprecatedMarkets(): UiMarketAndSummary[] {
      const { mappedMarkets, deprecatedMarketsSlugs } = this

      return mappedMarkets.filter((m) =>
        deprecatedMarketsSlugs.includes(m.market.slug)
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
        filteredUpcomingMarkets,
        filterType
      } = this

      if (filterType === MarketFilterType.New) {
        return newMarketsList
      }

      if (filterType === MarketFilterType.Volume) {
        return marketsSortedByVolume
      }

      if (filterType === MarketFilterType.Upcoming) {
        return filteredUpcomingMarkets
      }

      return filteredMarkets
    },

    marketsList(): UiMarketAndSummary[] {
      const { filteredMarketsList, limit } = this

      return filteredMarketsList.slice(0, limit)
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
