<script setup lang="ts">
import { OrderbookViewOption, UiMarketWithToken } from '@/types'

defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const activeTab = ref(OrderbookViewOption.Orderbook)
</script>

<template>
  <div class="pb-2">
    <div class="h-header border-b flex">
      <AppButtonSelect
        v-for="value in Object.values(OrderbookViewOption)"
        :key="value"
        v-model="activeTab"
        :value="value"
        class="text-sm font-semibold text-gray-500 capitalize px-4"
        active-classes="text-white"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>
    </div>

    <PartialsTradeOrderbookBuysSells
      v-if="activeTab === OrderbookViewOption.Orderbook"
      v-bind="{ market, isSpot }"
    />

    <PartialsTradeOrderbookTrades v-else v-bind="{ market, isSpot }" />
  </div>
</template>
