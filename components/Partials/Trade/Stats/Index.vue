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
  <div class="lg:h-header lg:flex relative max-lg:divide-y">
    <PartialsTradeStatsMarketSelector v-bind="{ market }" />
    <PartialsTradeStatsInfo v-bind="{ market }" />
  </div>
</template>
