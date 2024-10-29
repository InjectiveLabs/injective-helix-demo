<script setup lang="ts">
import { SharedUiSpotTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    trade: SharedUiSpotTrade
  }>(),
  {}
)

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
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
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
  <div v-if="market">
    <div class="flex p-2 text-xs font-mono">
      <div class="flex-1 flex items-center p-2 font-sans">{{ time }}</div>

      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p>{{ market.ticker }}</p>
      </PartialsCommonMarketRedirection>

      <div class="flex-[0.5] flex items-center p-2">
        <span class="font-sans">
          {{ tradeExecutionType }}
        </span>
      </div>

      <div
        class="flex-[0.5] flex items-center p-2 font-sans"
        :class="{
          'text-green-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{ $t(`trade.${trade.tradeDirection}`) }}
      </div>

      <div class="flex-1 flex items-center justify-end p-2">
        {{ priceToString }}
      </div>

      <div class="flex-1 flex items-center justify-end p-2">
        {{ quantityToString }}
      </div>

      <div class="flex-1 flex items-center justify-end p-2">
        <p class="flex">
          <span>
            {{ feeToString }}
          </span>
          <span class="ml-1 text-coolGray-500">
            {{ market?.quoteToken.symbol }}
          </span>
        </p>
      </div>

      <div class="flex-1 flex items-center p-2">
        <div class="space-y-1 flex-1 flex justify-end">
          <p v-if="market">
            <span>
              {{ totalToString }}
            </span>
            <span class="ml-1 text-coolGray-500">
              {{ market?.quoteToken.symbol }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
