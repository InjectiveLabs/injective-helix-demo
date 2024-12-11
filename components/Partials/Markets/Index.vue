<script setup lang="ts">
import { MarketCategoryType, UiMarketAndSummaryWithVolumeInUsd } from '@/types'

withDefaults(
  defineProps<{
    search?: string
    markets: UiMarketAndSummaryWithVolumeInUsd[]
    activeCategory: MarketCategoryType
    isLowVolumeMarketsVisible?: boolean
  }>(),
  {
    search: '',
    isLowVolumeMarketsVisible: false
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
