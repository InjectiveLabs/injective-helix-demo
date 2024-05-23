<script setup lang="ts">
import { SharedUiDerivativeTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/ts-types'

const props = defineProps({
  trade: {
    required: true,
    type: Object as PropType<SharedUiDerivativeTrade>
  }
})

const {
  fee,
  time,
  price,
  total,
  market,
  quantity,
  priceDecimals,
  quantityDecimals,
  tradeExecutionType
} = useTrade(
  computed(() => props.trade),
  computed(() => false)
)

const { valueToString: priceToString } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value
})

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: feeToString } = useSharedBigNumberFormatter(fee, {
  decimalPlaces: quantityDecimals.value
})

const { valueToString: totalToString } = useSharedBigNumberFormatter(total, {
  decimalPlaces: priceDecimals.value
})
</script>

<template>
  <div v-if="market">
    <div class="flex p-2 text-xs font-mono">
      <div class="flex-1 flex items-center p-2">{{ time }}</div>

      <PartialsCommonMarketRedirection
        v-if="market"
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p>{{ market.ticker }}</p>
      </PartialsCommonMarketRedirection>

      <div class="flex-1 flex items-center p-2">
        <span class="font-sans">{{ tradeExecutionType }}</span>
      </div>

      <div
        class="flex-1 flex items-center p-2"
        :class="{
          'text-green-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{ $t(`trade.${trade.tradeDirection}`) }}
      </div>

      <div class="flex-1 flex items-center p-2">{{ priceToString }}</div>

      <div class="flex-1 flex items-center p-2">{{ quantityToString }}</div>

      <div class="flex-1 flex items-center p-2 space-x-1">
        <span>{{ feeToString }}</span>
        <span v-if="market" class="text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </div>

      <div class="flex-1 flex items-center p-2 space-x-1">
        <span>{{ totalToString }}</span>
        <span v-if="market" class="text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </div>
    </div>
  </div>
</template>
