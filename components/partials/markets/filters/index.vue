<template>
  <div>
    <TabMenu>
      <template #items>
        <TabMenuItem
          :value="MarketType.Favorite"
          :active="activeType === MarketType.Favorite"
          data-cy="markets-favorites-selector"
          @click="handleTypeClick"
        >
          <span class="flex items-center">
            <IconStarBorder class="mr-1" />
            <span>{{ $t('trade.favorites') }}</span>
          </span>
        </TabMenuItem>

        <TabMenuItem
          :value="''"
          :active="activeType === ''"
          data-cy="markets-all-markets-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.allMarkets') }}
        </TabMenuItem>

        <TabMenuItem
          :value="MarketType.Spot"
          :active="activeType === MarketType.Spot"
          data-cy="markets-spot-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.spots') }}
        </TabMenuItem>

        <TabMenuItem
          :value="MarketType.Derivative"
          :active="activeType === MarketType.Derivative"
          data-cy="markets-perpetual-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.futures') }}
        </TabMenuItem>
      </template>

      <template #actions>
        <Search
          name="search"
          class="sm:w-auto md:w-3xs"
          input-classes="placeholder-white"
          dense
          transparent-bg
          data-cy="markets-search-input"
          :placeholder="$t('trade.search_markets')"
          :search="search"
          show-prefix
          @searched="handleSearchedEvent"
        />
      </template>
    </TabMenu>

    <div class="flex items-center justify-between mt-6 mb-2">
      <div class="flex items-center gap-2">
        <MarketCategorySelector
          v-for="marketCategoryType in marketCategoryTypes"
          :key="marketCategoryType.key"
          :type="marketCategoryType.type"
          :active="activeCategory === marketCategoryType.type"
          :data-cy="`market-category-${marketCategoryType.key}-button`"
          @click="handleCategoryChange"
        >
          {{ marketCategoryType.label }}
        </MarketCategorySelector>
      </div>

      <Selector
        :label="$t('markets.quote')"
        :options="quoteOptions"
        :value="activeQuote"
        @select="handleQuoteChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import MarketCategorySelector from '~/components/partials/markets/filters/market-category-selector.vue'
import Search from '~/components/inputs/search.vue'
import { MarketCategoryType, MarketQuoteType } from '~/types'
import TabMenu from '~/components/elements/tab-menu.vue'
import TabMenuItem from '~/components/elements/tab-menu-item.vue'
import Selector from '~/components/elements/selector.vue'

function getMarketCategoryTypes() {
  return Object.entries(MarketCategoryType).map(([key, value]) => {
    return {
      key: `market-category-type-${value}`,
      label: key,
      type: MarketCategoryType[key as keyof typeof MarketCategoryType]
    }
  })
}

function getQuoteOptions() {
  return Object.entries(MarketQuoteType).map(([key, value]) => {
    return {
      label: key,
      value
    }
  })
}

export default Vue.extend({
  components: {
    MarketCategorySelector,
    Search,
    TabMenu,
    TabMenuItem,
    Selector
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
      MarketQuoteType,
      marketCategoryTypes: getMarketCategoryTypes(),
      quoteOptions: getQuoteOptions()
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

    handleQuoteChange(quote: MarketQuoteType) {
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
