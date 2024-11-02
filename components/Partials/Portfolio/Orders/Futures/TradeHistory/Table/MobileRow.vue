<script setup lang="ts">
import { SharedUiDerivativeTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  LOW_FEE_AMOUNT_THRESHOLD,
  UI_DEFAULT_FEE_MIN_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

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
</script>

<template>
  <div v-if="market" class="p-2 text-xs divide-y border-b border-brand-700">
    <PartialsCommonMarketRedirection
      v-if="market"
      v-bind="{ market }"
      class="flex-1 flex items-center space-x-2 p-2 font-sans"
    >
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </PartialsCommonMarketRedirection>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.time') }}</p>
      <p>{{ time }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.type') }}</p>
      <p>{{ tradeExecutionType }}</p>
    </div>

    <div class="flex justify-between items-center px-2 py-4">
      <p>{{ $t('trade.side') }}</p>

      <p
        :class="{
          'text-green-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{ $t(`trade.${trade.tradeDirection}`) }}
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.price') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: price.toFixed(),
            decimalPlaces: priceDecimals
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p>
        <AppAmount
          v-bind="{
            amount: quantity.toFixed(),
            decimalPlaces: quantityDecimals
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
              amount: fee.toFixed(),
              decimalPlaces: fee.abs().lt(LOW_FEE_AMOUNT_THRESHOLD)
                ? UI_DEFAULT_FEE_MIN_DECIMALS
                : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
            }"
          />
        </span>
        <span v-if="market" class="text-coolGray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 pt-4 pb-2">
      <p>{{ $t('trade.total') }}</p>

      <p>
        <span>
          <AppAmount
            v-bind="{
              amount: total.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
        </span>
        <span v-if="market" class="text-coolGray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </p>
    </div>
  </div>
</template>
