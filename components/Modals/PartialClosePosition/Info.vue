<script lang="ts" setup>
import type { TransformedPosition } from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    row: TransformedPosition
    isMarketPositionClose?: boolean
    availableQuantity: BigNumberInBase
  }>(),
  {}
)
</script>

<template>
  <div class="flex gap-4 justify-between">
    <h5 class="text-coolGray-450 font-semibold">
      {{ $t('trade.partialClosePositionModal.totalPositionSize') }}
    </h5>

    <div
      class="flex items-center gap-1"
      :class="{
        'text-coolGray-500':
          !isMarketPositionClose && row.availableQuantity.lte(0)
      }"
    >
      <PartialsPositionsRemainingQuantity
        v-if="!isMarketPositionClose && row.usedQuantity.gt(0)"
        v-bind="{ market: row.market, usedQuantity: row.usedQuantity }"
      />

      <div
        class="flex items-center gap-1"
        :class="{
          'line-through': !isMarketPositionClose && row.availableQuantity.lte(0)
        }"
      >
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            decimals: row.quantityDecimals,
            amount: availableQuantity.toFixed()
          }"
        />
        <span>{{ row.market.baseToken.symbol }}</span>
      </div>
    </div>
  </div>

  <div v-if="isMarketPositionClose" class="flex gap-4 justify-between mt-6">
    <h5 class="text-coolGray-450 font-semibold">
      {{ $t('trade.price') }}
    </h5>
    <span>{{ $t('trade.market') }}</span>
  </div>

  <div v-else class="flex gap-4 justify-between mt-6">
    <h5 class="text-coolGray-450 font-semibold">
      {{ $t('trade.markPrice') }}
    </h5>

    <SharedAmount
      v-bind="{
        useSubscript: true,
        shouldAbbreviate: false,
        decimals: row.priceDecimals,
        amount: row.markPrice.toFixed()
      }"
    />
  </div>
</template>
