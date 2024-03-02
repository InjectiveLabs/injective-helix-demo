<script setup lang="ts">
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { UiMarketSummary, UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<UiMarketSummary>,
    required: true
  }
})
</script>

<template>
  <NuxtLink
    :to="{
      name: `${market.type === MarketType.Spot ? 'spot' : 'futures'}-slug`,
      params: { slug: market.slug }
    }"
    class="p-2 hover:bg-brand-800 text-gray-350 hover:text-white flex items-center"
  >
    <CommonTokenIcon v-bind="{ token: market.baseToken }" />

    <div class="pl-2 text-sm table-cell font-semibold tracking-wide text-white">
      {{ market.ticker }}
    </div>
  </NuxtLink>
</template>
