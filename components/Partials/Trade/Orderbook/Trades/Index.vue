<script setup lang="ts">
import {
  ORDERBOOK_ROWS,
  ORDERBOOK_ROW_HEIGHT,
  ORDERBOOK_HEADER_HEIGHT
} from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

const SECTION_HEIGHT =
  2 * ORDERBOOK_ROWS * ORDERBOOK_ROW_HEIGHT + ORDERBOOK_HEADER_HEIGHT

const NUMBER_OF_ROWS =
  ORDERBOOK_ROWS * 2 +
  Math.floor(ORDERBOOK_HEADER_HEIGHT / ORDERBOOK_ROW_HEIGHT)

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {
    isSpot: false
  }
)

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const trades = computed(() => {
  if (props.isSpot) {
    return spotStore.trades.slice(0, NUMBER_OF_ROWS)
  }

  return derivativeStore.trades.slice(0, NUMBER_OF_ROWS)
})
</script>

<template>
  <div class="px-3">
    <div class="flex justify-between py-2">
      <p class="text-xs space-x-1.5 flex-1">
        <span class="text-coolGray-500">{{ $t('trade.price') }}</span>
        <span class="font-bold uppercase">{{ market.quoteToken.symbol }}</span>
      </p>

      <p class="text-xs space-x-1.5 flex-1 text-center">
        <span class="text-coolGray-500">{{ $t('trade.amount') }}</span>
        <span class="font-bold">{{ market.baseToken.symbol }}</span>
      </p>

      <p class="text-xs space-x-1.5 flex-1 text-right">
        <span class="text-coolGray-500">{{ $t('trade.time') }}</span>
      </p>
    </div>

    <div :style="{ height: SECTION_HEIGHT + 'px' }">
      <template v-if="!trades.length">
        <PartialsTradeOrderbookBuysSellsSkeletonRecord
          v-for="index in NUMBER_OF_ROWS"
          :key="index"
          v-bind="{ index }"
          is-buy
        />
      </template>

      <template v-else>
        <PartialsTradeOrderbookTradesRow
          v-for="trade in trades"
          :key="trade.tradeId"
          class="text-xs"
          v-bind="{
            market,
            isSpot,
            trade
          }"
        />
      </template>
    </div>
  </div>
</template>
