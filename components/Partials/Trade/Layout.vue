<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const appStore = useAppStore()
</script>

<template>
  <div class="[grid-area:stats] border-b bg-brand-900 z-30 relative">
    <slot name="stats">
      <PartialsTradeStats v-bind="{ market }" />
    </slot>
  </div>

  <div
    class="lg:trade-layout-left w-full min-h-[calc(100vh-122px)]"
    :class="{ blur: appStore.marketsOpen }"
  >
    <div class="[grid-area:chart] lg:border-b">
      <slot name="chart">
        <PartialsTradeChart v-bind="{ market }" />
      </slot>
    </div>

    <div class="[grid-area:orderbook] lg:border-r lg:border-b">
      <slot name="orderbook">
        <div class="h-[620px]"></div>
      </slot>
    </div>

    <div class="[grid-area:form] lg:border-r">
      <slot name="form" />
    </div>

    <div class="[grid-area:orders]">
      <slot name="orders" />
    </div>
  </div>
</template>
