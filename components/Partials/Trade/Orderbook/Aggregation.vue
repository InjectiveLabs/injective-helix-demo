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
const isSpot = inject(IsSpotKey)
const aggregation = inject(AggregationKey, ref(1))

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
  <USelectMenu
    v-model="value"
    class="min-w-12"
    select-class="dark:bg-brand-875"
    v-bind="{
      options: filteredOptions
    }"
    size="xs"
    value-attribute="value"
    option-attribute="display"
    :ui="{
      base: 'dark:ring-0 font-semibold dark:cursor-pointer max-w-24 max-lg:max-w-full 5xl:max-w-full',
      rounded: 'rounded',
      trailing: {
        padding: {
          xs: 'pe-7'
        }
      },
      icon: {
        base: 'dark:text-white'
      }
    }"
    :ui-menu="{
      width: 'w-fit',
      option: {
        base: 'cursor-pointer',
        size: 'text-xs',
        selectedIcon: {
          base: 'w-3 h-3'
        }
      }
    }"
  />
</template>
