<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { countZerosAfterDecimal } from '@/app/utils/helpers'
import {
  IsSpotKey,
  MarketKey,
  AggregationKey,
  UiMarketWithToken
} from '@/types'

const market = inject(MarketKey)
const aggregation = inject(AggregationKey, ref(1))
const isSpot = inject(IsSpotKey)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  market as Ref<UiMarketWithToken>
)
const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  market as Ref<UiMarketWithToken>
)

const lastTradedPrice = computed(() =>
  isSpot ? spotLastTradedPrice.value : derivativeLastTradedPrice.value
)

const zerosAfterDecimal = computed(() =>
  countZerosAfterDecimal(lastTradedPrice.value.toFixed())
)

const value = computed({
  get: () => aggregation.value.toString(),
  set: (value: string) => {
    aggregation.value = Number(value)
  }
})

const items =
  market?.value?.priceDecimals === 0
    ? [-2, -1, 0]
    : market?.value?.priceDecimals === 1
    ? [-2, -1, 0, 1]
    : [
        ...new Array((market?.value?.priceDecimals || 0) + 1)
          .fill(0)
          .map((_, i) => i)
      ]

const options = items.map((value) => ({
  value: value.toString(),
  display: new BigNumberInBase(10).exponentiatedBy(-value).toFixed()
}))

const filteredOptions = computed(() =>
  zerosAfterDecimal.value > 4
    ? options.filter((option) => Number(option.value) > zerosAfterDecimal.value)
    : options
)
</script>

<template>
  <AppSelect
    v-model.number="value"
    v-bind="{
      options: filteredOptions
    }"
    wrapper-class="hover:bg-brand-850 border  border-transparent hover:border-brand-700 transition-all p-1 rounded mr-2 pl-2 select-none text-gray-400 hover:text-white"
  >
    <template #default="{ selected }">
      <p class="text-xs font-mono select-none">{{ selected?.display }}</p>
    </template>

    <template #option="{ option }">
      <p class="text-xs font-mono select-none">{{ option.display }}</p>
    </template>
  </AppSelect>
</template>
