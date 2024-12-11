<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)
</script>

<template>
  <div class="lg:flex lg:flex-col xl:flex-row relative max-lg:divide-y">
    <PartialsTradeStatsMarketSelector v-bind="{ market }" class="lg:h-header" />
    <PartialsTradeStatsInfo v-bind="{ market }" class="pl-2" />
  </div>
</template>
