<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UiDerivativeMarket } from '@/types'

withDefaults(
  defineProps<{
    position: PositionV2
    market: UiDerivativeMarket
    entryPrice: BigNumberInBase
    availableQuantityToFixed: string
    liquidationPrice: BigNumberInBase
    markPriceNotScaled: BigNumberInBase
  }>(),
  {}
)
</script>

<template>
  <div class="font-semibold text-xs">
    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.entryPrice') }}:</p>
      <p>
        <AppAmount
          v-bind="{
            amount: entryPrice.toFixed(),
            decimalPlaces: market.priceDecimals
          }"
        />
      </p>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.markPrice') }}:</p>
      <p>
        <AppAmount
          v-bind="{
            amount: markPriceNotScaled.toFixed(),
            decimalPlaces: market.priceDecimals
          }"
        />
      </p>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.estLiquidationPrice') }}:</p>
      <p>
        <AppAmount
          v-bind="{
            amount: liquidationPrice.toFixed(),
            decimalPlaces: market.priceDecimals
          }"
        />
      </p>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.totalQuantitySize') }}:</p>
      <p>
        <AppAmount
          v-bind="{
            amount: availableQuantityToFixed,
            decimalPlaces: market.priceDecimals
          }"
        />
      </p>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.direction') }}:</p>
      <p
        :class="{
          'text-green-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short
        }"
      >
        {{ $t(`trade.${position.direction}`) }}
      </p>
    </div>
  </div>
</template>
