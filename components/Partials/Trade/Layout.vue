<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <div class="[grid-area:stats] border-b bg-brand-900 z-30 relative">
    <slot name="stats">
      <PartialsTradeStats v-bind="{ market }" />
    </slot>
  </div>

  <div class="lg:trade-layout-left w-full min-h-[calc(100vh-122px)]">
    <div class="[grid-area:chart] lg:border-b">
      <slot name="chart">
        <PartialsTradeChart v-bind="{ market }" />
      </slot>
    </div>

    <div class="[grid-area:form] lg:border-r max-lg:border-t">
      <slot name="form" />
    </div>

    <div class="[grid-area:orderbook] lg:border-r lg:border-b max-lg:border-t">
      <slot name="orderbook">
        <PartialsTradeOrderbook v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div class="[grid-area:orders]">
      <slot name="orders" />
    </div>
  </div>
</template>
