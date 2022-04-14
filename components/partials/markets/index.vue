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

    <TableHeader>
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
      <span class="text-left col-span-2" />
    </TableHeader>

    <TableBody>
      <v-market-row
        v-for="({ market, summary, volumeInUsd }, index) in markets"
        :key="`market-row-${index}`"
        :market="market"
        :summary="summary"
        :volume-in-usd="volumeInUsd"
      />

      <template slot="empty">
        <span class="col-span-1 md:col-span-3 text-center xl:text-left">
          {{ $t('There are no results found - Markets') }}
        </span>
      </template>
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
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
