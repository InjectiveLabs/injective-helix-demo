<script setup lang="ts">
import { SharedUiSpotTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import {
  LOW_FEE_AMOUNT_THRESHOLD,
  UI_DEFAULT_FEE_MIN_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

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
  decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
})
</script>

<template>
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.time') }}</p>
      <p>{{ time }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.type') }}</p>
      <span class="font-sans">
        {{ tradeExecutionType }}
      </span>
    </div>

    <div class="flex items-center px-2 py-4 justify-between">
      <p>{{ $t('trade.side') }}</p>
      <span
        class="font-sans"
        :class="{
          'text-green-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{ $t(`trade.${trade.tradeDirection}`) }}
      </span>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.price') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: priceToFixed
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p>
        <AppAmount
          v-bind="{
            amount: quantityToFixed
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.fee') }}</p>

      <p>
        <span>
          <AppAmount
            v-bind="{
              amount: feeToFixed
            }"
          />
        </span>
        <span class="ml-1 text-coolGray-500">
          {{ market?.quoteToken.symbol }}
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 pt-4 pb-2">
      <p>{{ $t('trade.total') }}</p>

      <p v-if="market">
        <span>
          <AppAmount
            v-bind="{
              amount: totalToFixed
            }"
          />
        </span>
        <span class="ml-1 text-coolGray-500">
          {{ market?.quoteToken.symbol }}
        </span>
      </p>
    </div>
  </div>
</template>
