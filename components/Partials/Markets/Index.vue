<script setup lang="ts">
import {
  MarketQuoteType,
  MarketTypeOption,
  MarketCategoryType,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

defineProps({
  isLoading: Boolean,
  isMarketsPage: Boolean,
  isLowVolumeMarketsVisible: Boolean,

  activeCategory: {
    type: String as PropType<MarketCategoryType>,
    required: true
  },

  activeQuote: {
    type: String as PropType<MarketQuoteType>,
    required: true
  },

  activeType: {
    type: String as PropType<MarketTypeOption>,
    required: true
  },

  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  },

  search: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <AppHocLoading v-bind="{ isLoading }">
    <div class="overflow-x-auto">
      <div class="min-w-[800px]">
        <CommonHeadlessMarkets
          v-bind="{
            search,
            markets,
            activeType,
            activeQuote,
            activeCategory,
            isLowVolumeMarketsVisible
          }"
        >
          <template
            #default="{
              sortBy,
              onSortBy,
              onAscending,
              isAscending,
              sortedMarkets
            }"
          >
            <PartialsMarketsCommonHeader
              v-bind="{ isAscending, isMarketsPage, sortBy }"
              @update:is-ascending="onAscending"
              @update:sort-by="onSortBy"
            />

            <div class="divide-y">
              <PartialsMarketsCommonRow
                v-for="{ market, summary, volumeInUsd } in sortedMarkets"
                :key="market.marketId"
                v-bind="{ market, summary, volumeInUsd, isMarketsPage }"
              />
            </div>
          </template>
        </CommonHeadlessMarkets>
      </div>
    </div>
  </AppHocLoading>
</template>
