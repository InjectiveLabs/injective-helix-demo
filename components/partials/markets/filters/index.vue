<template>
  <div>
    <div class="flex items-center justify-between flex-wrap">
      <div
        class="flex items-centers gap-2 3md:gap-4 overflow-x-auto mb-4 2md:mb-0 justify-between xs:justify-start w-full xs:w-auto hide-scrollbar"
      >
        <MarketTypeSelector
          :type="MarketType.Favorite"
          :active="activeType === MarketType.Favorite"
          data-cy="markets-favorites-selector"
          @click="handleTypeClick"
        >
          <span class="flex items-center">
            <IconStar class="mr-1" />
            <span>{{ $t('trade.favorites') }}</span>
          </span>
        </MarketTypeSelector>

        <MarketTypeSelector
          :type="''"
          :active="activeType === ''"
          data-cy="markets-all-markets-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.allMarkets') }}
        </MarketTypeSelector>

        <MarketTypeSelector
          :type="MarketType.Spot"
          :active="activeType === MarketType.Spot"
          data-cy="markets-spot-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.spots') }}
        </MarketTypeSelector>

        <MarketTypeSelector
          :type="MarketType.Perpetual"
          :active="activeType === MarketType.Perpetual"
          data-cy="markets-perpetual-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.perpetual') }}
        </MarketTypeSelector>
      </div>

      <VSearch
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
        <MarketQuoteSelector
          :active="activeQuote === MarketQuoteType.All"
          :type="MarketQuoteType.All"
          data-cy="markets-quote-all-button"
          @click="handleQuoteClick"
        >
          {{ $t('trade.all') }}
        </MarketQuoteSelector>
        <div class="border-r h-4 border-gray-600 w-px" />
        <MarketQuoteSelector
          :active="activeQuote === MarketQuoteType.USDT"
          :type="MarketQuoteType.USDT"
          data-cy="markets-quote-usdt-button"
          @click="handleQuoteClick"
        >
          USDT
        </MarketQuoteSelector>
      </div>

      <MarketCategorySelector
        :type="activeCategory"
        @click="handleCategoryChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import MarketCategorySelector from '~/components/partials/markets/filters/market-category-selector.vue'
import MarketTypeSelector from '~/components/partials/markets/filters/market-type-selector.vue'
import MarketQuoteSelector from '~/components/partials/markets/filters/market-quote-selector.vue'
import VSearch from '~/components/inputs/search.vue'
import { MarketCategoryType, MarketQuoteType } from '~/types'

export default Vue.extend({
  components: {
    MarketCategorySelector,
    MarketQuoteSelector,
    MarketTypeSelector,
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
    clearRouteQueryParam(key: string) {
      const query = { ...this.$route.query }
      delete query[key]

      this.$router.replace({ query })
    },

    fillRouteQueryParams(params: Record<string, string>) {
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          ...params
        }
      })
    },

    handleCategoryChange(category: MarketCategoryType) {
      this.$emit('update:activeCategory', category)

      if (category === this.activeCategory) {
        return
      }

      if (!category || category === MarketCategoryType.All) {
        this.clearRouteQueryParam('category')
      } else {
        this.fillRouteQueryParams({ category })
      }
    },

    handleSearchedEvent(search: string) {
      this.$emit('update:search', search)
    },

    handleQuoteClick(quote: MarketQuoteType) {
      this.$emit('update:activeQuote', quote)

      if (quote === this.activeQuote) {
        return
      }

      if (!quote || quote === MarketQuoteType.All) {
        this.clearRouteQueryParam('quote')
      } else {
        this.fillRouteQueryParams({ quote })
      }
    },

    handleTypeClick(type: string) {
      this.$emit('update:activeType', type)

      if (type === this.activeType) {
        return
      }

      if (!type || type === '') {
        this.clearRouteQueryParam('type')
      } else {
        this.fillRouteQueryParams({ type: type.toLowerCase() })
      }
    }
  }
})
</script>
