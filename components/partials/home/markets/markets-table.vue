<template>
  <div>
    <div
      class="overflow-x-auto md:overflow-x-visible w-full bg-gray-900 rounded"
    >
      <TableHeader v-if="markets.length !== 0" lg class="pt-0 bg-gray-800 pb-5">
        <span class="text-left col-span-3">
          {{ $t('trade.market') }}
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            <span class="flex-1 text-right">{{
              $t('trade.last_traded_price')
            }}</span>
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.last_traded_price_tooltip')"
            />
          </div>
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('trade.market_change_24h') }}
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.market_change_24h_tooltip')"
            />
          </div>
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('trade.market_volume_24h') }}
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.market_volume_24h_tooltip')"
            />
          </div>
        </span>
      </TableHeader>

      <TableBody>
        <Market
          v-for="({ market, summary }, index) in marketsList"
          :key="`market-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
        />
        <MarketNew
          v-for="({ market, summary }, index) in filteredUpcomingMarkets"
          :key="`market-new-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
        />
        <MarketDeprecated
          v-for="({ market, summary }, index) in filteredDeprecatedMarkets"
          :key="`market-deprecated-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
        />
      </TableBody>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import {
  ZERO_IN_BASE,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import Market from '~/components/partials/home/markets/market.vue'
import MarketNew from '~/components/partials/home/markets/market-new.vue'
import MarketDeprecated from '~/components/partials/home/markets/market-deprecated.vue'
import {
  deprecatedMarkets,
  newMarketsSlug,
  upcomingMarkets
} from '~/app/data/market'
import { MarketFilterType, UiMarketAndSummary } from '~/types'

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    Market,
    MarketDeprecated,
    MarketNew
  },

  props: {
    filterType: {
      type: String as PropType<MarketFilterType>,
      default: MarketFilterType.All
    },

    showAll: {
      type: Boolean,
      default: false
    },

    markets: {
      type: Array as PropType<
        Array<UiDerivativeMarketWithToken | UiSpotMarketWithToken>
      >,
      required: true
    },

    summaries: {
      type: Array as PropType<
        Array<UiDerivativeMarketSummary | UiSpotMarketSummary>
      >,
      required: true
    }
  },

  data() {
    return {
      limit: 5
    }
  },

  computed: {
    mappedMarkets(): UiMarketAndSummary[] {
      const { markets, summaries } = this

      return markets
        .map((market) => {
          return {
            market,
            summary: summaries.find(
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
    },

    totalVolume(): BigNumberInBase {
      const { filteredMarkets } = this

      return filteredMarkets.reduce((total, { summary }) => {
        if (!summary.volume || Number.isNaN(summary.volume)) {
          return total
        }

        return total.plus(summary.volume)
      }, ZERO_IN_BASE)
    },

    totalVolumeToFormat(): string {
      const { totalVolume } = this

      return totalVolume.toFormat(0, BigNumberInBase.ROUND_DOWN)
    }
  }
})
</script>
