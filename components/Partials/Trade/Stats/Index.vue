<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SharedMarketType } from '@shared/types'
import {
  TradeSubPage,
  SpotMarketCyTags,
  TradeSubPagePath,
  MarketCategoryType
} from '@/types'
import type { UiMarketWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const route = useRoute()
const breakpoints = useSharedBreakpoints()

const sm = breakpoints.sm

const isMarketOpen = ref(false)

const isExpiryMarket = computed(
  () => props.market.subType === SharedMarketType.Futures
)

const flexColClass = computed(() => {
  if (route.name === TradeSubPage.Spot) {
    return 'max-2xl:flex-col'
  }

  if (isExpiryMarket.value) {
    return 'max-3xl:flex-col'
  }

  return 'max-4xl:flex-col'
})

onMounted(() => {
  if (route.query.category) {
    Object.keys(MarketCategoryType).forEach((category) => {
      if (
        category.toLowerCase() ===
        route.query?.category?.toString()?.toLowerCase()
      ) {
        isMarketOpen.value = true
      }
    })
  }

  if (route.path.startsWith(TradeSubPagePath.Stocks)) {
    isMarketOpen.value = true
  }
})
</script>

<template>
  <div
    :class="[flexColClass]"
    class="lg:flex relative border-b max-lg:divide-y"
    :data-cy="dataCyTag(SpotMarketCyTags.TradeStats)"
  >
    <PartialsTradeStatsMarketSelector
      v-model:is-market-open="isMarketOpen"
      v-bind="{ market }"
      :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsMarketSelector)"
      :class="isExpiryMarket ? 'max-3xl:h-header' : 'max-4xl:h-header'"
    />

    <PartialsTradeStatsInfo
      v-show="!isMarketOpen || sm"
      class="pl-2"
      :class="{ 'relative z-30': isMarketOpen }"
      v-bind="{
        market,
        dataCy: dataCyTag(SpotMarketCyTags.TradeStatsInfo)
      }"
    />

    <div
      v-if="isMarketOpen"
      class="absolute backdrop-blur-sm h-vhMinusHeader w-screen z-20 top-0 left-0"
    />
  </div>
</template>
