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
  <div
    class="trade-layout-left w-full divide-x divide-y min-h-[calc(100vh-54px)]"
  >
    <div class="[grid-area:stats]">
      <slot name="stats"> <div class="h-header">Stats</div> </slot>
    </div>

    <div class="[grid-area:form]">
      <slot name="form" />
    </div>

    <div class="[grid-area:orderbook]">
      <slot name="orderbook">
        <div class="h-[600px]"></div>
      </slot>
    </div>

    <div class="[grid-area:chart]">
      <slot name="chart">
        <PartialsTradeChart v-bind="{ market }" />
      </slot>
    </div>

    <div class="[grid-area:orders]">
      <slot name="orders" />
    </div>
  </div>
</template>

<style>
.trade-layout-left {
  display: grid;
  grid-template-rows: auto auto 1fr;
  grid-template-columns: 500px 400px 1fr;

  grid-template-areas:
    'stats stats stats'
    'form orderbook chart'
    'form orders orders';
}
</style>
