<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import {
  TradeSubPage,
  SpotMarketCyTags,
  TradeSubPagePath,
  MarketCategoryType
} from '@/types'
import type { UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const route = useRoute()
const breakpoints = useSharedBreakpoints()

const sm = breakpoints.sm

const isMarketOpen = ref(false)

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
    class="lg:flex relative border-b max-lg:divide-y"
    :class="[
      route.name === TradeSubPage.Spot ? 'max-2xl:flex-col' : 'max-5xl:flex-col'
    ]"
    :data-cy="dataCyTag(SpotMarketCyTags.TradeStats)"
  >
    <PartialsTradeStatsMarketSelector
      v-model:is-market-open="isMarketOpen"
      v-bind="{ market }"
      class="lg:h-header"
      :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsMarketSelector)"
    />

    <PartialsTradeStatsInfo
      v-show="!isMarketOpen || sm"
      v-bind="{ market }"
      class="pl-2 relative z-30"
      :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsInfo)"
    />

    <div
      v-if="isMarketOpen"
      class="absolute backdrop-blur-sm h-vhMinusHeader w-screen z-20 top-0 left-0"
    />
  </div>
</template>
