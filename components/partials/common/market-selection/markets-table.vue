<template>
  <div>
    <v-market-filter
      class="mb-2"
      :active-type.sync="activeType"
      :search.sync="search"
    />
    <TableHeader classes="grid grid-cols-2 md:grid">
      <div class="flex items-center">
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
        <span class="mx-1 select-none">/</span>
        <SortableHeaderItem
          :value="MarketHeaderType.Volume"
          :sort-by="sortBy"
          :ascending="ascending"
          @sort="handleSort"
        >
          <span class="text-gray-200 text-xs">
            {{ $t('trade.volume') }}
          </span>
        </SortableHeaderItem>
      </div>

      <SortableHeaderItem
        class="justify-end"
        :value="MarketHeaderType.Change"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span slot="prefix" class="text-gray-200 text-xs mr-1">
          {{ $t('trade.price') }} /
        </span>

        <span class="text-gray-200 text-xs">
          {{ $t('trade.market_change') }}
        </span>
      </SortableHeaderItem>
    </TableHeader>

    <TableBody
      :show-empty="sortedMarkets.length === 0"
      class="rounded overflow-hidden"
    >
      <v-market-row
        v-for="({ market, summary, volumeInUsd }, index) in sortedMarkets"
        :key="`market-row-${index}`"
        :class="{
          'pt-4': index === 0,
          'pb-4': index + 1 === sortedMarkets.length
        }"
        :market="market"
        :summary="summary"
        :volume-in-usd="volumeInUsd"
      />

      <v-empty-list
        slot="empty"
        classes="min-h-3xs"
        :message="$t('markets.emptyHeader')"
      >
        <span class="mt-1 text-2xs text-gray-500">
          {{ $t('markets.emptyDescription') }}
        </span>
      </v-empty-list>
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MarketType } from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'
import VMarketFilter from '~/components/partials/common/market-selection/markets-filter.vue'
import SortableHeaderItem from '~/components/elements/sortable-header-item.vue'
import TableBody from '~/components/elements/table-body.vue'
import VMarketRow from '~/components/partials/common/market-selection/markets-table-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import { UiMarketAndSummaryWithVolumeInUsd } from '~/types'
import { marketIsPartOfType, marketIsPartOfSearch } from '~/app/utils/market'

enum MarketHeaderType {
  Market = 'market',
  Change = 'change',
  Volume = 'volume'
}

export default Vue.extend({
  components: {
    SortableHeaderItem,
    TableHeader,
    VMarketFilter,
    VMarketRow,
    TableBody
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
      const { activeType, favoriteMarkets, markets, search } = this

      return markets.filter(({ market }) => {
        const isPartOfSearch = marketIsPartOfSearch(search, market)
        const isPartOfType = marketIsPartOfType({
          market,
          favoriteMarkets,
          activeType: activeType as MarketType
        })

        return isPartOfType && isPartOfSearch
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
