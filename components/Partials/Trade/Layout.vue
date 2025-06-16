<script setup lang="ts">
import type { UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {}
)
</script>

<template>
  <div class="[grid-area:stats] border-b bg-brand-900 z-30">
    <PartialsTradeCommonMarketMultiplierBanner v-bind="{ market }" />

    <slot name="stats">
      <PartialsTradeStats v-bind="{ market }" />
    </slot>
  </div>

  <div
    class="lg:trade-layout-right w-full min-h-[calc(100vh-140px)] max-lg:divide-y"
  >
    <div class="[grid-area:chart]">
      <slot name="chart">
        <PartialsTradeChart v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div class="[grid-area:form] border-coolGray-700 lg:min-h-[950px]">
      <slot name="form" />
    </div>

    <div class="[grid-area:orderbook] border-r">
      <slot name="orderbook">
        <PartialsTradeOrderbook v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div
      class="[grid-area:orders] relative lg:h-full border-t border-r lg:overflow-auto"
    >
      <div class="lg:absolute left-0 right-0 top-0 h-full">
        <slot name="orders" />
      </div>
    </div>
  </div>

  <PartialsTradeNotificationLimit v-bind="{ isSpot }" />
</template>
