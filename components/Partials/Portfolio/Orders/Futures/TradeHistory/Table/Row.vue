<script setup lang="ts">
import { SharedUiDerivativeTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/ts-types'
import { PerpetualMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    trade: SharedUiDerivativeTrade
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
  computed(() => false)
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
  decimalPlaces: quantityDecimals.value
})

const { valueToString: totalToString } = useSharedBigNumberFormatter(total, {
  decimalPlaces: priceDecimals.value
})
</script>

<template>
  <div v-if="market" class="flex p-2 text-xs font-mono">
    <div
      class="flex-1 flex items-center p-2"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTimestamp)"
    >
      {{ time }}
    </div>

    <PartialsCommonMarketRedirection
      v-if="market"
      v-bind="{ market }"
      class="flex-1 flex items-center space-x-2 p-2 font-sans"
    >
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryMarketTicker)">
        {{ market.ticker }}
      </p>
    </PartialsCommonMarketRedirection>

    <div class="flex-[0.5] flex items-center p-2">
      <span
        class="font-sans"
        :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTradeType)"
      >
        {{ tradeExecutionType }}
      </span>
    </div>

    <div
      class="flex-[0.5] flex items-center p-2"
      :class="{
        'text-green-500': trade.tradeDirection === TradeDirection.Buy,
        'text-red-500': trade.tradeDirection === TradeDirection.Sell
      }"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTradeSide)"
    >
      {{ $t(`trade.${trade.tradeDirection}`) }}
    </div>

    <div
      class="flex-1 flex items-center p-2 justify-end"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryPrice)"
    >
      {{ priceToString }}
    </div>

    <div
      class="flex-1 flex items-center p-2 justify-end"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryAmount)"
    >
      {{ quantityToString }}
    </div>

    <div class="flex-1 flex items-center p-2 space-x-1 justify-end">
      <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryFee)">{{
        feeToString
      }}</span>
      <span v-if="market" class="text-gray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </div>

    <div class="flex-1 flex items-center p-2 space-x-1 justify-end">
      <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTotal)">{{
        totalToString
      }}</span>
      <span v-if="market" class="text-gray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </div>
  </div>
</template>
