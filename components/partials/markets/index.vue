<template>
  <div class="container xl:max-w-6xl mx-auto py-6 md:py-12">
    <h3 class="text-xl tracking-wider leading-6 font-bold md:hidden mb-6">
      {{ $t('markets.title') }}
    </h3>

    <v-market-filter
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
        <span class="text-gray-200 text-xs">
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
        <span class="text-gray-200 text-xs">
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
        <span class="text-gray-200 text-xs">
          {{ $t('trade.volume_24h') }}
        </span>
      </SortableHeaderItem>
      <span class="hidden 3md:block text-left col-span-2" />
    </TableHeader>

    <TableBody light :show-empty="sortedMarkets.length === 0">
      <v-market-row
        v-for="({ market, summary, volumeInUsd }, index) in sortedMarkets"
        :key="`market-row-${index}`"
        :market="market"
        :summary="summary"
        :volume-in-usd="volumeInUsd"
      />

      <v-empty-list
        slot="empty"
        classes="bg-gray-850 min-h-3xs"
        :message="$t('markets.emptyHeader')"
      >
        <span class="mt-2 text-xs text-gray-500">{{
          $t('markets.emptyDescription')
        }}</span>
      </v-empty-list>
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import VMarketFilter from '~/components/partials/markets/filters/index.vue'
import VMarketRow from '~/components/partials/markets/market-row.vue'
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
    VMarketFilter,
    VMarketRow
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
          activeType,
          market,
          favoriteMarkets
        })
        const isQuotePair = marketIsQuotePair(activeQuote, market)

        return isPartOfCategory && isPartOfType && isPartOfSearch && isQuotePair
      })
    },

    sortedMarkets(): UiMarketAndSummaryWithVolumeInUsd[] {
      const { filteredMarkets, ascending, sortBy } = this

      if (sortBy.trim() === '') {
        return filteredMarkets
      }

      const list = [...filteredMarkets].sort(
        (
          m1: UiMarketAndSummaryWithVolumeInUsd,
          m2: UiMarketAndSummaryWithVolumeInUsd
        ) => {
          if (sortBy === MarketHeaderType.Market) {
            return m2.market.ticker.localeCompare(m1.market.ticker)
          }

          if (sortBy === MarketHeaderType.Change) {
            return new BigNumberInBase(m2.summary.change)
              .minus(m1.summary.change)
              .toNumber()
          }

          // default: sort by volume
          return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
        }
      )

      return ascending ? list.reverse() : list
    }
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
    }
  }
})
</script>
