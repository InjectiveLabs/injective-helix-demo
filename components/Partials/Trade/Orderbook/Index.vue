<script setup lang="ts">
import {
  OrderbookLayout,
  OrderbookViewOption,
  UiMarketWithToken
} from '@/types'

defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const orderbookOptions = [
  {
    value: OrderbookLayout.Default,
    img: '/svg/orderbook/default.svg'
  },
  {
    value: OrderbookLayout.Buys,
    img: '/svg/orderbook/buys.svg'
  },
  {
    value: OrderbookLayout.Sells,
    img: '/svg/orderbook/sells.svg'
  }
]

const orderbookLayout = ref(OrderbookLayout.Default)
const activeTab = ref(OrderbookViewOption.Orderbook)

function setOrderbookLayout(layout: OrderbookLayout) {
  orderbookLayout.value = layout
}
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

      <div class="flex items-center justify-end flex-1 space-x-1">
        <img
          v-for="option in orderbookOptions"
          :key="option.value"
          :src="option.img"
          :class="{ 'opacity-50': orderbookLayout !== option.value }"
          class="cursor-pointer"
          @click="setOrderbookLayout(option.value)"
        />
      </div>

      <div
        v-if="activeTab === OrderbookViewOption.Orderbook"
        class="flex flex-1 items-center justify-end"
      >
        <PartialsTradeOrderbookAggregation />
      </div>
    </div>

    <PartialsTradeOrderbookBuysSells
      v-if="activeTab === OrderbookViewOption.Orderbook"
      v-bind="{ market, isSpot, orderbookLayout }"
    />

    <PartialsTradeOrderbookTrades v-else v-bind="{ market, isSpot }" />
  </div>
</template>
