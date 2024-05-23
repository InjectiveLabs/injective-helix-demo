<script setup lang="ts">
import { SharedUiSpotTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  trade: {
    required: true,
    type: Object as PropType<SharedUiSpotTrade>
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
  computed(() => true)
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
  decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
})

const { valueToString: totalToString } = useSharedBigNumberFormatter(total, {
  decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
})
</script>

<template>
  <PartialsCommonMarketRedirection v-if="market" v-bind="{ market }">
    <div class="flex p-2 text-xs font-mono">
      <div class="flex-1 flex items-center p-2 font-sans">{{ time }}</div>

      <div
        v-if="market"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p>{{ market.ticker }}</p>
      </div>

      <div class="flex-1 flex items-center p-2">
        <span class="font-sans">
          {{ tradeExecutionType }}
        </span>
      </div>

      <div
        class="flex-1 flex items-center p-2 font-sans"
        :class="{
          'text-green-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{ $t(`trade.${trade.tradeDirection}`) }}
      </div>

      <div class="flex-1 flex items-center p-2">{{ priceToString }}</div>

      <div class="flex-1 flex items-center p-2">{{ quantityToString }}</div>

      <div class="flex-1 flex items-center p-2">
        <p class="flex-1">
          <span>
            {{ feeToString }}
          </span>
          <span class="ml-1 text-gray-500">
            {{ market?.quoteToken.symbol }}
          </span>
        </p>
      </div>

      <div class="flex-1 flex items-center p-2">
        <div class="space-y-1 flex-1">
          <p v-if="market">
            <span>
              {{ totalToString }}
            </span>
            <span class="ml-1 text-gray-500">
              {{ market?.quoteToken.symbol }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </PartialsCommonMarketRedirection>
</template>
