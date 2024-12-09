<script setup lang="ts">
import { MarketCategoryType, UiMarketAndSummaryWithVolumeInUsd } from '@/types'

withDefaults(
  defineProps<{
    search?: string
    markets: UiMarketAndSummaryWithVolumeInUsd[]
    isLoading?: boolean
    activeCategory: MarketCategoryType
    isLowVolumeMarketsVisible?: boolean
  }>(),
  {
    search: '',
    isLoading: false,
    isLowVolumeMarketsVisible: false
  }
)
</script>

<template>
  <AppHocLoading v-bind="{ isLoading }">
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
          <PartialsMarketsCommonTable v-bind="{ sortedMarkets }" />
        </template>
      </CommonHeadlessMarkets>
    </div>
  </AppHocLoading>
</template>
