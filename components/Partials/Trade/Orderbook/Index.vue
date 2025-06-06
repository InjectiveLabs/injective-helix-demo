<script setup lang="ts">
import {
  OrderbookLayout,
  OrderbookViewOption,
  UiMarketWithToken,
  SpotMarketCyTags
} from '@/types'

withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {
    isSpot: false
  }
)

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
  <div class="pb-2" :data-cy="dataCyTag(SpotMarketCyTags.OrderbookGrid)">
    <div class="h-subHeader border-b-2 flex items-center pr-2">
      <AppButtonSelect
        v-for="value in Object.values(OrderbookViewOption)"
        :key="value"
        v-model="activeTab"
        :value="value"
        class="text-xs font-medium text-coolGray-450 capitalize mx-2 max-lg:mx-3 5xl:mx-3 py-2 border-b-2 border-solid border-transparent"
        :data-cy="`${dataCyTag(SpotMarketCyTags.OrderbookGrid)}-${value}`"
        active-classes="text-white border-blue-550"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>

      <div
        v-if="activeTab === OrderbookViewOption.Orderbook"
        class="flex flex-1 items-center justify-end"
      >
        <div class="flex items-center space-x-1 mr-1">
          <img
            v-for="option in orderbookOptions"
            :key="option.value"
            :src="option.img"
            :class="{ 'opacity-50': orderbookLayout !== option.value }"
            class="cursor-pointer"
            :data-cy="dataCyTag(SpotMarketCyTags.OrderbookViewOptions)"
            @click="setOrderbookLayout(option.value)"
          />
        </div>

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
