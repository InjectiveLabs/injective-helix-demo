<template>
  <div>
    <div class="flex items-center justify-between flex-wrap">
      <div
        class="flex items-centers gap-2 3md:gap-4 overflow-x-auto mb-4 2md:mb-0 justify-between xs:justify-start w-full xs:w-auto hide-scrollbar"
      >
        <v-market-type-selector
          :type="MarketType.Favourite"
          :active="activeType === MarketType.Favourite"
          data-cy="markets-favorites-selector"
          @click="handleTypeClick"
        >
          <span class="flex items-center">
            <v-icon-star class="mr-1" />
            <span>{{ $t('trade.favorites') }}</span>
          </span>
        </v-market-type-selector>

        <v-market-type-selector
          :type="''"
          :active="activeType === ''"
          data-cy="markets-all-markets-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.allMarkets') }}
        </v-market-type-selector>

        <v-market-type-selector
          :type="MarketType.Spot"
          :active="activeType === MarketType.Spot"
          data-cy="markets-spot-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.spots') }}
        </v-market-type-selector>

        <v-market-type-selector
          :type="MarketType.Perpetual"
          :active="activeType === MarketType.Perpetual"
          data-cy="markets-perpetual-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.perpetual') }}
        </v-market-type-selector>
      </div>

      <v-search
        name="search"
        class="sm:w-auto md:w-xs"
        wrapper-classes="bg-gray-800 rounded-3xl pl-2"
        dense
        transparent-bg
        data-cy="markets-search-input"
        :placeholder="$t('trade.search_markets')"
        :search="search"
        @searched="handleSearchedEvent"
      />
    </div>

    <div class="flex items-center justify-between mt-6">
      <div class="flex items-center gap-3 md:gap-6">
        <v-market-quote-selector
          :active="activeQuote === MarketQuoteType.All"
          :type="MarketQuoteType.All"
          data-cy="markets-quote-all-button"
          @click="handleQuoteClick"
        >
          {{ $t('trade.all') }}
        </v-market-quote-selector>
        <div class="border-r h-4 border-gray-600 w-px" />
        <v-market-quote-selector
          :active="activeQuote === MarketQuoteType.USDT"
          :type="MarketQuoteType.USDT"
          data-cy="markets-quote-usdt-button"
          @click="handleQuoteClick"
        >
          USDT
        </v-market-quote-selector>
        <div class="border-r h-4 border-gray-600 w-px" />
        <v-market-quote-selector
          :active="activeQuote === MarketQuoteType.UST"
          :type="MarketQuoteType.UST"
          data-cy="markets-quote-ust-button"
          @click="handleQuoteClick"
        >
          UST
        </v-market-quote-selector>
      </div>

      <v-market-category-selector
        :type="activeCategory"
        @click="handleCategoryChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MarketType } from '@injectivelabs/ui-common'
import VMarketCategorySelector from '~/components/partials/markets/filters/market-category-selector.vue'
import VMarketTypeSelector from '~/components/partials/markets/filters/market-type-selector.vue'
import VMarketQuoteSelector from '~/components/partials/markets/filters/market-quote-selector.vue'
import VSearch from '~/components/inputs/search.vue'
import { MarketCategoryType, MarketQuoteType } from '~/types'

export default Vue.extend({
  components: {
    VMarketCategorySelector,
    VMarketQuoteSelector,
    VMarketTypeSelector,
    VSearch
  },

  props: {
    activeCategory: {
      type: String as PropType<MarketCategoryType>,
      required: true
    },

    activeQuote: {
      type: String as PropType<MarketQuoteType>,
      required: true
    },

    activeType: {
      type: String,
      required: true
    },

    search: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      MarketCategoryType,
      MarketType,
      MarketQuoteType
    }
  },

  methods: {
    handleCategoryChange(category: MarketCategoryType) {
      this.$emit('update:activeCategory', category)
    },

    handleSearchedEvent(search: string) {
      this.$emit('update:search', search)
    },

    handleQuoteClick(quote: MarketQuoteType) {
      this.$emit('update:activeQuote', quote)
    },

    handleTypeClick(type: string) {
      this.$emit('update:activeType', type)
    }
  }
})
</script>
