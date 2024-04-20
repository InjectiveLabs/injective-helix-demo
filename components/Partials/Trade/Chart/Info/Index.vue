<script setup lang="ts">
import { BigNumber } from '@injectivelabs/utils'
import {
  UiExpiryFuturesMarketWithToken,
  UiPerpetualMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { spotMarketKey, derivativeMarketKey, isSpotKey } from '@/types'

const spotMarket = inject(spotMarketKey, undefined)
const derivativeMarket = inject(derivativeMarketKey, undefined) as
  | ComputedRef<UiPerpetualMarketWithToken | UiExpiryFuturesMarketWithToken>
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
</script>

<template>
  <div v-if="market" class="lg:flex">
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
        <p class="text-gray-400 text-sm leading-6 text-justify">
          Ethereum is a decentralized open-source blockchain system that
          features its own cryptocurrency, Ether (ETH). ETH works as a platform
          for numerous other cryptocurrencies, as well as for the execution of
          decentralized smart contracts.
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
    </div>
  </div>
</template>
