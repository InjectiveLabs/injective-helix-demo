<script setup lang="ts">
import { ORDERBOOK_ROWS } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const activeBuysIndex = ref(-1)
const activeSellsIndex = ref(-1)

function setBuysIndex(index: number) {
  activeBuysIndex.value = index
}

function setSellsIndex(index: number) {
  activeSellsIndex.value = index
}
</script>

<template>
  <div class="px-2">
    <div class="flex justify-between pt-2">
      <p class="text-xs space-x-1.5 flex-1 text-right">
        <span class="text-gray-500">{{ $t('trade.price') }}</span>
        <span class="font-bold uppercase">{{ market.quoteToken.symbol }}</span>
      </p>

      <p class="text-xs space-x-1.5 flex-1 text-right">
        <span class="text-gray-500">{{ $t('trade.amount') }}</span>
        <span class="font-bold uppercase">{{ market.baseToken.symbol }}</span>
      </p>

      <p class="text-xs space-x-1.5 flex-1 text-right">
        <span class="text-gray-500">{{ $t('trade.total') }}</span>
        <span class="font-bold uppercase">{{ market.quoteToken.symbol }}</span>
      </p>
    </div>

    <div class="flex flex-col-reverse" @mouseleave="activeSellsIndex = -1">
      <PartialsTradeOrderbookBuysSellsRecord
        v-for="i in ORDERBOOK_ROWS"
        v-bind="{ isActive: i <= activeSellsIndex, index: i }"
        :key="i"
        @set:index="setSellsIndex"
      />
    </div>

    <div class="h-header border-y">asd</div>

    <div @mouseleave="activeBuysIndex = -1">
      <PartialsTradeOrderbookBuysSellsRecord
        v-for="i in ORDERBOOK_ROWS"
        v-bind="{ isActive: i <= activeBuysIndex, index: i }"
        :key="i"
        is-buy
        @set:index="setBuysIndex"
      />
    </div>
  </div>
</template>
