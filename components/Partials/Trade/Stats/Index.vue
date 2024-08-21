<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const isMobile = useIsMobile()
</script>

<template>
  <div class="lg:h-header lg:flex relative max-lg:divide-y">
    <PartialsTradeStatsMarketSelector v-bind="{ market }" />

    <PartialsTradeStatsInfo v-if="!isMobile" v-bind="{ market }" />
    <PartialsTradeStatsInfoMobile v-else v-bind="{ market }" />
  </div>
</template>
