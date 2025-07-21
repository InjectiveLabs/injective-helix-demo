<script setup lang="ts">
import { TradeDirection } from '@injectivelabs/ts-types'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { PerpetualMarketCyTags } from '@/types'
import type { UiDerivativeMarket } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { BigNumberInBase } from '@injectivelabs/utils'

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
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: entryPrice.toFixed(),
            decimals: market.priceDecimals
          }"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlEditFormEntryPrice)"
        />
      </p>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.markPrice') }}:</p>
      <p>
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            decimals: market.priceDecimals,
            amount: markPriceNotScaled.toFixed()
          }"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlEditFormMarkPrice)"
        />
      </p>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.estLiquidationPrice') }}:</p>
      <p>
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            decimals: market.priceDecimals,
            amount: liquidationPrice.toFixed()
          }"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlEditFormEstLiqPrice)"
        />
      </p>
    </div>

    <div class="flex justify-between items-center border-b py-2">
      <p>{{ $t('trade.totalQuantitySize') }}:</p>
      <div class="flex items-center gap-1">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: availableQuantityToFixed,
            decimals: market.quantityDecimals || DEFAULT_ASSET_DECIMALS
          }"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlEditFormTotalQtySize)"
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
