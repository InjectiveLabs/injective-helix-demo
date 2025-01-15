<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

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
  <div class="lg:flex lg:flex-col xl:flex-row relative max-lg:divide-y">
    <PartialsTradeStatsMarketSelector
      v-model:is-market-open="isMarketOpen"
      v-bind="{ market }"
      class="lg:h-header max-lg:max-w-none max-xl:max-w-fit"
    />

    <PartialsTradeStatsInfo
      v-show="!isMarketOpen || sm"
      v-bind="{ market }"
      class="pl-2"
    />
  </div>
</template>
