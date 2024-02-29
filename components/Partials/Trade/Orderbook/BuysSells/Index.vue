<script setup lang="ts">
import { ORDERBOOK_ROWS, ORDERBOOK_ROW_HEIGHT } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const SECTION_HEIGHT = ORDERBOOK_ROWS * ORDERBOOK_ROW_HEIGHT + 'px'

const orderbookStore = useOrderbookStore()

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
  <div>
    <div class="flex justify-between pt-2 px-2">
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

    <div
      :style="{ height: SECTION_HEIGHT }"
      class="flex flex-col-reverse px-2"
      @mouseleave="activeSellsIndex = -1"
    >
      <template v-if="orderbookStore.buys.length === 0">
        <PartialsTradeOrderbookBuysSellsSkeletonRecord
          v-for="i in ORDERBOOK_ROWS"
          :key="i"
          :index="i"
        />
      </template>

      <PartialsTradeOrderbookBuysSellsRecord
        v-for="(record, i) in orderbookStore.sells"
        v-bind="{
          isActive: i <= activeSellsIndex,
          index: i,
          record,
          highestVolume:
            orderbookStore.sells[orderbookStore.sells.length - 1].totalVolume
        }"
        :key="i"
        @set:index="setSellsIndex"
      />
    </div>

    <div class="h-header border-y my-1">asd</div>

    <div
      :style="{ height: SECTION_HEIGHT }"
      class="px-2"
      @mouseleave="activeBuysIndex = -1"
    >
      <template v-if="orderbookStore.sells.length === 0">
        <PartialsTradeOrderbookBuysSellsSkeletonRecord
          v-for="i in ORDERBOOK_ROWS"
          :key="i"
          :index="i"
        />
      </template>

      <PartialsTradeOrderbookBuysSellsRecord
        v-for="(record, i) in orderbookStore.buys"
        v-bind="{
          isActive: i <= activeBuysIndex,
          index: i,
          record,
          highestVolume:
            orderbookStore.buys[orderbookStore.buys.length - 1].totalVolume
        }"
        :key="i"
        is-buy
        @set:index="setBuysIndex"
      />
    </div>
  </div>
</template>
