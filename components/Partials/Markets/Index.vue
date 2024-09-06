<script setup lang="ts">
import {
  MarketQuoteType,
  MarketTypeOption,
  MarketCategoryType,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

withDefaults(
  defineProps<{
    search?: string
    markets: UiMarketAndSummaryWithVolumeInUsd[]
    isLoading?: boolean
    activeType: MarketTypeOption
    activeQuote: MarketQuoteType
    activeCategory: MarketCategoryType
    isMarketsPage?: boolean
    isLowVolumeMarketsVisible?: boolean
  }>(),
  {
    search: '',
    isLoading: false,
    isMarketsPage: false,
    isLowVolumeMarketsVisible: false
  }
)
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
