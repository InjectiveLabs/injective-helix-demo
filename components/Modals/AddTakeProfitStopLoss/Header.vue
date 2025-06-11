<script setup lang="ts">
import { PerpetualMarketCyTags } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import type { UiDerivativeMarket } from '@/types'

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
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlEditFormEntryPrice)"
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlEditFormMarkPrice)"
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
      <div class="flex items-center gap-1">
        <AppAmount
          v-bind="{
            amount: availableQuantityToFixed,
            decimalPlaces:
              market.quantityDecimals || UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
          }"
        />
        <span>{{ market.baseToken.symbol }}</span>
      </div>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.direction') }}:</p>
      <p
        :class="{
          'text-green-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short
        }"
        :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlFormTradeDirection)"
      >
        {{ $t(`trade.${position.direction}`) }}
      </p>
    </div>
  </div>
</template>
