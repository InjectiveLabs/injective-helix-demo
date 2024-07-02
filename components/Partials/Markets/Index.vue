<script setup lang="ts">
import {
  MarketQuoteType,
  MarketHeaderType,
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

const isAscending = ref(false)
const sortBy = ref(MarketHeaderType.Volume)

function handleIsAscending(value: boolean) {
  isAscending.value = value
}

function handleSortBy(value: MarketHeaderType) {
  sortBy.value = value
}
</script>

<template>
  <AppHocLoading v-bind="{ isLoading }">
    <div class="overflow-x-auto">
      <div class="min-w-[800px]">
        <PartialsMarketsCommonHeader
          v-bind="{ isAscending, isMarketsPage, sortBy }"
          @update:is-ascending="handleIsAscending"
          @update:sort-by="handleSortBy"
        />

        <div class="divide-y">
          <CommonHeadlessMarkets
            v-bind="{
              search,
              sortBy,
              markets,
              activeType,
              isAscending,
              activeQuote,
              activeCategory,
              isLowVolumeMarketsVisible
            }"
          >
            <template #default="{ sortedMarkets }">
              <PartialsMarketsCommonRow
                v-for="{ market, summary, volumeInUsd } in sortedMarkets"
                :key="market.marketId"
                v-bind="{ market, summary, volumeInUsd, isMarketsPage }"
              />
            </template>
          </CommonHeadlessMarkets>
        </div>
      </div>
    </div>
  </AppHocLoading>
</template>
