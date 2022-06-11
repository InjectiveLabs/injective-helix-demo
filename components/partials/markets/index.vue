<template>
  <div class="container xl:max-w-6xl mx-auto py-6 md:py-12">
    <h3 class="text-xl tracking-wider leading-6 font-bold md:hidden mb-6">
      {{ $t('markets.title') }}
    </h3>

    <MarketFilter
      :active-category.sync="activeCategory"
      :active-quote.sync="activeQuote"
      :active-type.sync="activeType"
      :search.sync="search"
    />
    <div class="border-b border-gray-600 w-full h-px pb-4 mb-4 md:hidden" />

    <!-- mobile header -->
    <TableHeader classes="grid grid-cols-3 md:hidden">
      <SortableHeaderItem
        :value="MarketHeaderType.Market"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span class="text-gray-200 text-xs">
          {{ $t('trade.market') }}
        </span>
      </SortableHeaderItem>

      <SortableHeaderItem
        class="justify-end col-span-2"
        :value="MarketHeaderType.Change"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span slot="prefix" class="text-gray-200 text-xs mr-1">
          {{ $t('trade.last_price') }} /
        </span>

        <span class="text-gray-200 text-xs">
          {{ $t('trade.market_change_24h') }}
        </span>
      </SortableHeaderItem>
    </TableHeader>

    <TableHeader class="grid-cols-10 3md:grid-cols-12">
      <SortableHeaderItem
        class="col-span-3"
        :value="MarketHeaderType.Market"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span
          class="text-gray-200 text-xs"
          data-cy="markets-market-table-header"
        >
          {{ $t('trade.market') }}
        </span>
      </SortableHeaderItem>

      <span class="text-right col-span-2">
        <span class="text-gray-200 text-xs">
          {{ $t('trade.last_price') }}
        </span>
      </span>

      <SortableHeaderItem
        class="col-span-2 justify-end"
        :value="MarketHeaderType.Change"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span
          class="text-gray-200 text-xs"
          data-cy="markets-change_24h-table-header"
        >
          {{ $t('trade.market_change_24h') }}
        </span>
      </SortableHeaderItem>

      <SortableHeaderItem
        class="col-span-3 justify-end"
        :value="MarketHeaderType.Volume"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span
          class="text-gray-200 text-xs"
          data-cy="markets-volume_24h-table-header"
        >
          {{ $t('trade.volume_24h') }}
        </span>
      </SortableHeaderItem>
      <span class="hidden 3md:block text-left col-span-2" />
    </TableHeader>

    <TableBody light :show-empty="sortedMarkets.length === 0">
      <MarketRow
        v-for="({ market, summary, volumeInUsd }, index) in sortedMarkets"
        :key="`market-row-${index}`"
        :market="market"
        :summary="summary"
        :volume-in-usd="volumeInUsd"
      />

      <EmptyList
        slot="empty"
        classes="bg-gray-850 min-h-3xs"
        data-cy="markets-no-data-table"
        :message="$t('markets.emptyHeader')"
      >
        <span class="mt-2 text-xs text-gray-500">{{
          $t('markets.emptyDescription')
        }}</span>
      </EmptyList>
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import MarketFilter from '~/components/partials/markets/filters/index.vue'
import MarketRow from '~/components/partials/markets/market-row.vue'
import SortableHeaderItem from '~/components/elements/sortable-header-item.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import {
  MarketCategoryType,
  MarketQuoteType,
  UiMarketAndSummaryWithVolumeInUsd
} from '~/types'
import {
  marketIsPartOfCategory,
  marketIsQuotePair,
  marketIsPartOfType,
  marketIsPartOfSearch
} from '~/app/utils/market'
import { deprecatedMarkets, upcomingMarkets } from '~/app/data/market'

enum MarketHeaderType {
  Market = 'market',
  Change = 'change',
  Volume = 'volume'
}

export default Vue.extend({
  components: {
    SortableHeaderItem,
    TableBody,
    TableHeader,
    MarketFilter,
    MarketRow
  },

  props: {
    markets: {
      type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
      required: true
    }
  },

  data() {
    return {
      MarketHeaderType,
      activeCategory: MarketCategoryType.All,
      activeQuote: MarketQuoteType.All,
      activeType: '',
      search: '',
      sortBy: MarketHeaderType.Volume,
      ascending: false
    }
  },

  computed: {
    favoriteMarkets(): string[] {
      return this.$accessor.app.favoriteMarkets
    },

    filteredMarkets(): UiMarketAndSummaryWithVolumeInUsd[] {
      const {
        activeCategory,
        activeQuote,
        activeType,
        favoriteMarkets,
        markets,
        search
      } = this

      return markets.filter(({ market }) => {
        const isPartOfCategory = marketIsPartOfCategory(activeCategory, market)
        const isPartOfSearch = marketIsPartOfSearch(search, market)
        const isPartOfType = marketIsPartOfType({
          market,
          favoriteMarkets,
          activeType: activeType as MarketType
        })
        const isQuotePair = marketIsQuotePair(activeQuote, market)

        return isPartOfCategory && isPartOfType && isPartOfSearch && isQuotePair
      })
    },

    sortedMarkets(): UiMarketAndSummaryWithVolumeInUsd[] {
      const { filteredMarkets, ascending, sortBy } = this
      const upcomingMarketsSlugs = upcomingMarkets.map(({ slug }) => slug)
      const deprecatedMarketsSlugs = deprecatedMarkets.map(({ slug }) => slug)

      if (sortBy.trim() === '') {
        return filteredMarkets
      }

      const list = [...filteredMarkets].sort(
        (
          m1: UiMarketAndSummaryWithVolumeInUsd,
          m2: UiMarketAndSummaryWithVolumeInUsd
        ) => {
          if (
            upcomingMarketsSlugs.includes(m1.market.slug) ||
            deprecatedMarketsSlugs.includes(m1.market.slug)
          ) {
            return 1
          }

          if (sortBy === MarketHeaderType.Market) {
            return m2.market.ticker.localeCompare(m1.market.ticker)
          }

          if (sortBy === MarketHeaderType.Change) {
            if (new BigNumberInBase(m2.summary.change).eq(m1.summary.change)) {
              return m1.market.ticker.localeCompare(m2.market.ticker)
            }

            return new BigNumberInBase(m2.summary.change)
              .minus(m1.summary.change)
              .toNumber()
          }

          if (new BigNumberInBase(m2.volumeInUsd).eq(m1.volumeInUsd)) {
            return m1.market.ticker.localeCompare(m2.market.ticker)
          }

          // default: sort by volume
          return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
        }
      )

      return ascending ? list.reverse() : list
    }
  },

  mounted() {
    this.preFillFromQueryParams()
  },

  methods: {
    handleSort(type: MarketHeaderType) {
      if (type !== this.sortBy) {
        this.sortBy = type
        this.ascending = false
      } else if (this.ascending) {
        this.ascending = false
      } else {
        this.ascending = true
      }
    },

    preFillFromQueryParams() {
      const {
        $route: { query }
      } = this
      const category = (
        typeof query.category === 'string'
          ? query.category.trim().toLowerCase()
          : query.category
      ) as MarketCategoryType

      const quote = (
        typeof query.quote === 'string'
          ? query.quote.trim().toLowerCase()
          : query.quote
      ) as MarketQuoteType

      const type = (
        typeof query.type === 'string'
          ? query.type.trim().toLowerCase()
          : query.type
      ) as MarketType

      if (quote && Object.values(MarketQuoteType).includes(quote)) {
        this.activeQuote = quote
      }

      if (category && Object.values(MarketCategoryType).includes(category)) {
        this.activeCategory = category
      }

      if (type && MarketType.Favorite.toLowerCase() === type) {
        this.activeType = MarketType.Favorite
      }

      if (type && MarketType.Spot.toLowerCase() === type) {
        this.activeType = MarketType.Spot
      }

      if (type && [MarketType.Perpetual.toLowerCase(), 'perp'].includes(type)) {
        this.activeType = MarketType.Perpetual
      }
    }
  }
})
</script>
