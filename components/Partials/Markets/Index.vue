<script setup lang="ts">
import { MarketCategoryType } from '@/types'
import type { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

withDefaults(
  defineProps<{
    search?: string
    activeCategory: MarketCategoryType
    isLowVolumeMarketsVisible?: boolean
    markets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {
    search: ''
  }
)
</script>

<template>
  <div class="divide-y">
    <CommonHeadlessMarkets
      v-bind="{
        search,
        markets,
        activeCategory,
        isLowVolumeMarketsVisible
      }"
    >
      <template #default="{ sortedMarkets }">
        <AppHocLoading
          v-bind="{
            isLoading:
              !search.trim() &&
              !sortedMarkets.length &&
              activeCategory === MarketCategoryType.All,
            wrapperClass: 'mt-4'
          }"
        >
          <PartialsMarketsCommonTable v-bind="{ sortedMarkets }" />
        </AppHocLoading>
      </template>
    </CommonHeadlessMarkets>
  </div>
</template>
