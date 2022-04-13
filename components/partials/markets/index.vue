<template>
  <div class="container py-6 md:py-12">
    <h3 class="text-xl tracking-wider leading-6 font-bold md:hidden mb-6">
      {{ $t('markets.title') }}
    </h3>

    <v-market-filter
      :active-category.sync="activeCategory"
      :active-quote.sync="activeQuote"
      :active-type.sync="activeType"
      :search.sync="search"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VMarketFilter from '~/components/partials/markets/filters/index.vue'
import {
  MarketCategoryType,
  MarketQuoteType,
  UiMarketAndSummary
} from '~/types'

export default Vue.extend({
  components: {
    VMarketFilter
  },

  props: {
    markets: {
      type: Array as PropType<UiMarketAndSummary[]>,
      required: true
    }
  },

  data() {
    return {
      activeCategory: MarketCategoryType.All,
      activeQuote: MarketQuoteType.All,
      activeType: '',
      search: ''
    }
  },

  methods: {}
})
</script>
