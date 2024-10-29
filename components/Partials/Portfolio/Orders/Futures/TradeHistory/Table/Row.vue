<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SharedUiDerivativeTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  LOW_FEE_AMOUNT_THRESHOLD,
  UI_DEFAULT_FEE_MIN_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
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

const { valueToFixed: priceToFixed } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const { valueToFixed: quantityToFixed } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToFixed: feeToFixed } = useSharedBigNumberFormatter(fee, {
  decimalPlaces: computed(() => {
    if (fee.value.abs().lt(LOW_FEE_AMOUNT_THRESHOLD)) {
      return UI_DEFAULT_FEE_MIN_DECIMALS
    }

    return UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
  })
})

const { valueToFixed: totalToFixed } = useSharedBigNumberFormatter(total, {
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
      <AppAmount
        v-bind="{
          amount: priceToFixed
        }"
      />
    </div>

    <div
      class="flex-1 flex items-center p-2 justify-end"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryAmount)"
    >
      <AppAmount
        v-bind="{
          amount: quantityToFixed
        }"
      />
    </div>

    <div class="flex-1 flex items-center p-2 space-x-1 justify-end">
      <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryFee)">
        <AppAmount
          v-bind="{
            amount: feeToFixed
          }"
      /></span>
      <span v-if="market" class="text-coolGray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </div>

    <div class="flex-1 flex items-center p-2 space-x-1 justify-end">
      <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTotal)">
        <AppAmount
          v-bind="{
            amount: totalToFixed
          }"
      /></span>
      <span v-if="market" class="text-coolGray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </div>
  </div>
</template>
