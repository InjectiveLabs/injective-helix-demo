<script setup lang="ts">
import { BigNumber } from '@injectivelabs/utils'
import {
  isSpotKey,
  spotMarketKey,
  UiDerivativeMarket,
  derivativeMarketKey
} from '@/types'
import { MARKETS_INFO } from '~/app/data/marketInfo'

const spotMarket = inject(spotMarketKey, undefined)
const derivativeMarket = inject(derivativeMarketKey, undefined) as
  | ComputedRef<UiDerivativeMarket>
  | undefined
const isSpot = inject(isSpotKey)

const market = computed(() =>
  isSpot ? spotMarket?.value : derivativeMarket?.value
)

const priceTickSize = computed(() => {
  if (!market.value) {
    return ''
  }

  return BigNumber(10).pow(market.value.priceTensMultiplier)
})

const quantityTickSize = computed(() => {
  if (!market.value) {
    return ''
  }
  return BigNumber(10).exponentiatedBy(market.value.quantityTensMultiplier)
})

const maxLeverage = computed(() => {
  if (!derivativeMarket || isSpot) {
    return ''
  }

  return BigNumber(1).dividedBy(derivativeMarket.value.initialMarginRatio).dp(0)
})

const description = computed(() => {
  if (!market.value) {
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
    <div class="flex-1 p-8">
      <div class="flex">
        <div class="flex items-center pr-4">
          <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        </div>
        <div class="flex items-center">
          <div>
            <p class="font-semibold">{{ market.ticker }}</p>
            <p class="text-gray-400 text-xs">{{ market.baseToken.name }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <p
          v-if="description"
          class="text-gray-400 text-sm leading-6 text-justify"
        >
          {{ description }}
        </p>
      </div>
    </div>

    <div class="flex-1 p-8 text-gray-400 text-xs tracking-wider space-y-2">
      <div class="flex justify-between border-b pb-1">
        <p>Market Name:</p>
        <p>{{ market.ticker }}</p>
      </div>

      <div class="flex justify-between border-b pb-1">
        <p>Tick Size:</p>
        <p>
          {{ priceTickSize }}
        </p>
      </div>

      <div class="flex justify-between border-b pb-1">
        <p>Min. Limit Order Size:</p>
        <p>{{ quantityTickSize }}</p>
      </div>

      <div
        v-if="!isSpot && derivativeMarket"
        class="flex justify-between border-b pb-1"
      >
        <p>Max. Leverage:</p>
        <p>{{ maxLeverage }}</p>
      </div>

      <pre>
        {{ market }}
      </pre>
    </div>
  </div>
</template>
