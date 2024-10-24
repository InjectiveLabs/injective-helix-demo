<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {
    isSpot: false
  }
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
    class="lg:trade-layout-left w-full min-h-[calc(100vh-122px)] max-lg:divide-y"
  >
    <div class="[grid-area:chart]">
      <slot name="chart">
        <PartialsTradeChart v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div class="[grid-area:form] border-r">
      <slot name="form" />
    </div>

    <div class="[grid-area:orderbook] border-r">
      <slot name="orderbook">
        <PartialsTradeOrderbook v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div
      class="[grid-area:orders] relative h-[500px] overflow-x-auto border-t border-b"
    >
      <div class="absolute left-0 right-0 top-0">
        <div class="lg:min-w-[1600px]">
          <slot name="orders" />
        </div>
      </div>
    </div>
  </div>
</template>
