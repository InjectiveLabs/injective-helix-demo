<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <div class="h-header flex relative">
    <PartialsTradeStatsMarketSelector v-bind="{ market }" />
    <PartialsTradeStatsInfo v-bind="{ market }" />
  </div>
</template>
