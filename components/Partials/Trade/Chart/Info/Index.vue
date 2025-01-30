<script setup lang="ts">
import { BigNumber } from '@injectivelabs/utils'
import { MARKETS_INFO } from '@/app/data/marketInfo'
import { IsSpotKey, MarketKey, UiDerivativeMarket } from '@/types'

const isSpot = inject(IsSpotKey)
const market = inject(MarketKey)

const priceTickSize = computed(() => {
  if (!market || !market.value) {
    return ''
  }

  return BigNumber(10).pow(market.value.priceTensMultiplier).toFixed()
})

const quantityTickSize = computed(() => {
  if (!market || !market.value) {
    return ''
  }
  return BigNumber(10)
    .exponentiatedBy(market.value.quantityTensMultiplier)
    .toFixed()
})

const maxLeverage = computed(() => {
  if (!market || !market.value || isSpot) {
    return ''
  }

  return BigNumber(1)
    .dividedBy((market.value as UiDerivativeMarket).initialMarginRatio)
    .dp(0)
})

const description = computed(() => {
  if (!market || !market.value) {
    return ''
  }

  return MARKETS_INFO.find(
    (info) =>
      info.symbol.toLowerCase() === market.value?.baseToken.symbol.toLowerCase()
  )?.description
})
</script>

<template>
  <div v-if="market" class="lg:flex overflow-y-auto">
    <div class="basis-[500px] p-8">
      <div class="flex">
        <div class="flex items-center pr-4">
          <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        </div>
        <div class="flex items-center">
          <div>
            <p class="font-semibold">{{ market.ticker }}</p>
            <p class="text-coolGray-400 text-xs">{{ market.baseToken.name }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <p v-if="description" class="text-coolGray-400 text-sm leading-6">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="flex-1 p-8 text-coolGray-400 text-xs tracking-wider space-y-2">
      <div class="flex justify-between border-b pb-1">
        <p>{{ $t('trade.marketName') }}:</p>
        <p>{{ market.ticker }}</p>
      </div>

      <div class="flex justify-between border-b pb-1">
        <p>{{ $t('trade.tickSize') }}:</p>
        <p>
          {{ priceTickSize }}
        </p>
      </div>

      <div class="flex justify-between border-b pb-1">
        <p>{{ $t('trade.minLimitOrderSize') }}:</p>
        <p>{{ quantityTickSize }}</p>
      </div>

      <div v-if="!isSpot" class="flex justify-between border-b pb-1">
        <p>{{ $t('trade.maxLeverage') }}:</p>
        <p>{{ maxLeverage }}</p>
      </div>

      <div class="flex justify-between border-b pb-1 gap-8">
        <p>
          <span class="whitespace-nowrap">{{ $t('markets.marketId') }}:</span>
        </p>

        <p class="truncate">{{ market.marketId }}</p>
      </div>
    </div>
  </div>
</template>
