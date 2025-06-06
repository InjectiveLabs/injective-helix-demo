<script lang="ts" setup>
import type { TransformedPosition } from '@/types'

withDefaults(
  defineProps<{
    row: TransformedPosition
    isMarketPositionClose?: boolean
  }>(),
  {}
)
</script>

<template>
  <div class="flex gap-4 justify-between">
    <h5 class="text-coolGray-450 font-semibold">
      {{ $t('partialClosePosition.totalPositionSize') }}
    </h5>

    <div class="flex items-center gap-1">
      <AppAmount
        v-bind="{
          amount: row.quantity.toFixed(),
          decimalPlaces: row.quantityDecimals
        }"
      />
      <span>{{ row.market.baseToken.symbol }}</span>
    </div>
  </div>

  <div v-if="isMarketPositionClose" class="flex gap-4 justify-between mt-6">
    <h5 class="text-coolGray-450 font-semibold">
      {{ $t('trade.price') }}
    </h5>
    <span>{{ $t('home.market') }}</span>
  </div>

  <div v-else class="flex gap-4 justify-between mt-6">
    <h5 class="text-coolGray-450 font-semibold">
      {{ $t('trade.markPrice') }}
    </h5>

    <AppAmount
      v-bind="{
        amount: row.markPrice.toFixed(),
        decimalPlaces: row.priceDecimals
      }"
    />
  </div>
</template>
