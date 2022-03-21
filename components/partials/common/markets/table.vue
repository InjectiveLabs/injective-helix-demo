<template>
  <div>
    <v-markets-filter
      v-if="simple"
      class="mb-6"
      :market-base.sync="marketBase"
      :market-type.sync="marketBase"
      :search.sync="search"
    />
    <div
      class="overflow-x-auto md:overflow-x-visible w-full bg-gray-900 rounded"
      :class="{
        'h-full overflow-y-auto ': simple
      }"
    >
      <TableHeader
        v-if="markets.length !== 0"
        :sm="simple"
        :lg="!simple"
        class="pt-0 bg-gray-800"
        :class="{ 'pb-5': !simple }"
      >
        <span
          class="text-left"
          :class="{ 'col-span-5': simple, 'col-span-3': !simple }"
        >
          {{ $t('trade.market') }}
        </span>
        <span :class="{ 'col-span-4': simple, 'col-span-3': !simple }">
          <div class="flex items-center relative justify-end">
            <span class="flex-1 text-right">{{
              $t('trade.last_traded_price')
            }}</span>
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('trade.last_traded_price_tooltip')"
            />
          </div>
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('trade.market_change_24h') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('trade.market_change_24h_tooltip')"
            />
          </div>
        </span>
        <span v-if="!simple" class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('trade.market_volume_24h') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('trade.market_volume_24h_tooltip')"
            />
          </div>
        </span>
      </TableHeader>

      <TableBody :show-empty="filteredMarkets.length === 0" :round="simple">
        <v-market
          v-for="({ market, summary }, index) in marketsList"
          :key="`market-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
          :simple="simple"
        />
        <v-market-new
          v-for="({ market, summary }, index) in filteredUpcomingMarkets"
          :key="`market-new-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
          :simple="simple"
        />
        <template slot="empty">
          <span class="col-span-1 md:col-span-3 text-center xl:text-left">{{
            $t('There are no results found - Markets')
          }}</span>
        </template>
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
} from '@injectivelabs/ui-common'
import VMarketsFilter from './markets-filter.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import VMarket from '~/components/partials/common/markets/market.vue'
import VMarketNew from '~/components/partials/common/markets/market-new.vue'
import { promotedMarketSlugs } from '~/app/data/market'

export interface UiMarketAndSummary {
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
  summary: UiDerivativeMarketSummary | UiSpotMarketSummary
}

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    VMarket,
    VMarketNew,
    VMarketsFilter
  },

  props: {
    simple: {
      default: false,
      type: Boolean
    },

    showPromoted: {
      type: Boolean,
      default: false
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
      marketType: '' as string,
      marketBase: '' as string,
      search: ''
    }
  },

  computed: {
    mappedMarkets(): UiMarketAndSummary[] {
      const { markets, summaries } = this

      return markets.map((market) => {
        return {
          market,
          summary: summaries.find(
            (summary) => summary.marketId === market.marketId
          )
        }
      }) as UiMarketAndSummary[]
    },

    filteredAllMarkets(): UiMarketAndSummary[] {
      const { search, marketType, marketBase, mappedMarkets } = this

      const query = search.toLowerCase()

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
    },

    filteredMarkets(): UiMarketAndSummary[] {
      const { filteredAllMarkets } = this

      return filteredAllMarkets.filter((m) => !m.market.upcoming)
    },

    filteredUpcomingMarkets(): UiMarketAndSummary[] {
      const { filteredAllMarkets } = this

      return filteredAllMarkets.filter((m) => !!m.market.upcoming)
    },

    marketsSortedByVolume(): UiMarketAndSummary[] {
      const { filteredMarkets } = this

      return filteredMarkets.sort((marketA, marketB) => {
        const aVolume = marketA.summary.volume
        const bVolume = marketB.summary.volume

        return new BigNumberInBase(bVolume).minus(aVolume).toNumber()
      })
    },

    promotedMarketsList(): UiMarketAndSummary[] {
      const { filteredMarkets } = this

      return filteredMarkets.filter(({ market: { slug } }) => {
        return promotedMarketSlugs.includes(slug.toLowerCase())
      })
    },

    marketsList(): UiMarketAndSummary[] {
      const {
        filteredMarkets,
        marketsSortedByVolume,
        promotedMarketsList,
        simple,
        showAll,
        showPromoted
      } = this

      const marketsList = simple ? filteredMarkets : marketsSortedByVolume

      if (showPromoted) {
        return promotedMarketsList
      }

      if (showAll) {
        return marketsList
      }

      return marketsList.slice(0, 5)
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
