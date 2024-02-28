<script setup lang="ts">
import {
  ORDERBOOK_ROWS,
  ORDERBOOK_ROW_HEIGHT,
  ORDERBOOK_HEADER_HEIGHT
} from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const SECTION_HEIGHT =
  2 * ORDERBOOK_ROWS * ORDERBOOK_ROW_HEIGHT + ORDERBOOK_HEADER_HEIGHT

const NUMBER_OF_ROWS =
  ORDERBOOK_ROWS * 2 +
  Math.floor(ORDERBOOK_HEADER_HEIGHT / ORDERBOOK_ROW_HEIGHT)
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
        <span class="text-gray-500">{{ $t('trade.time') }}</span>
      </p>
    </div>

    <div :style="{ height: SECTION_HEIGHT + 'px' }">
      <p v-for="i in NUMBER_OF_ROWS" :key="i" class="text-xs">Rows</p>
    </div>
  </div>
</template>
