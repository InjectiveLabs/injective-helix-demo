<script lang="ts" setup>
import { PropType } from 'vue'
import { UiMarketWithToken } from '@/types'
import { MAX_SYMBOL_LENGTH, SYMBOL_DISPLAY_LENGTH } from '@/app/utils/constants'

const props = defineProps({
  market: {
    required: true,
    type: Object as PropType<UiMarketWithToken>
  }
})

const baseTokenSymbolFormatted = computed(() => {
  const symbol = props.market.baseToken.symbol.toUpperCase()

  if (symbol.length > MAX_SYMBOL_LENGTH) {
    return `${symbol.slice(0, SYMBOL_DISPLAY_LENGTH)}...`
  }

  return props.market.baseToken.symbol
})
</script>

<template>
  <div class="h-8">
    <table class="table market-data">
      <thead xs>
        <tr>
          <th class="w-1/3 text-right">
            <span>{{ $t('trade.price') }}</span>
            <span
              class="font-semibold text-white uppercase inline-block lg:hidden xl:inline-block"
            >
              {{ market.quoteToken.symbol }}
            </span>
          </th>
          <th class="w-1/3 text-right">
            <span>{{ $t('trade.amount') }}</span>
            <span
              class="font-semibold text-white uppercase inline-block lg:hidden xl:inline-block"
            >
              {{ baseTokenSymbolFormatted }}
            </span>
          </th>
          <th class="w-1/3 text-right">
            <span>{{ $t('trade.total') }}</span>
            <span
              class="font-semibold text-white uppercase inline-block lg:hidden xl:inline-block"
            >
              {{ market.quoteToken.symbol }}
            </span>
          </th>
        </tr>
      </thead>
    </table>
  </div>
</template>
