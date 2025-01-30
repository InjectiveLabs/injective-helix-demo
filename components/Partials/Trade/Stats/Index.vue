<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { UiMarketWithToken, SpotMarketCyTags } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const breakpoints = useSharedBreakpoints()

const sm = breakpoints.sm

const isMarketOpen = ref(false)
</script>

<template>
  <div
    class="lg:flex lg:flex-col xl:flex-row relative max-lg:divide-y"
    :data-cy="dataCyTag(SpotMarketCyTags.TradeStats)"
  >
    <PartialsTradeStatsMarketSelector
      v-model:is-market-open="isMarketOpen"
      v-bind="{ market }"
      class="lg:h-header max-lg:max-w-none max-xl:max-w-fit"
      :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsMarketSelector)"
    />

    <PartialsTradeStatsInfo
      v-show="!isMarketOpen || sm"
      v-bind="{ market }"
      class="pl-2"
      :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsInfo)"
    />
  </div>
</template>
