<script setup lang="ts">
import { UButton } from '#components'
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { countZerosAfterDecimal } from '@/app/utils/helpers'
import { IsSpotKey, MarketKey, TradeCyTags, AggregationKey } from '@/types'
import type { UiMarketWithToken } from '@/types'

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

const selectedOption = computed(() =>
  options.find((item) => item.value === value.value)
)

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
  >
    <UButton
      class="dark:ring-0 font-semibold dark:cursor-pointer max-w-24 max-lg:max-w-full 5xl:max-w-full dark:bg-brand-875 dark:text-white dark:hover:bg-brand-875"
    >
      <div
        class="flex items-center gap-2 dark:text-white text-xs"
        :data-cy="dataCyTag(TradeCyTags.AggregationSelector)"
      >
        <span>
          {{ selectedOption?.display }}
        </span>

        <UIcon
          :name="NuxtUiIcons.ChevronDown"
          class="size-3 transition-all dark:text-white -mb-0.5"
        />
      </div>
    </UButton>

    <template #option="{ option }">
      <span class="mr-1" :data-cy="dataCyTag(TradeCyTags.Aggregation)">
        {{ option.display }}
      </span>
    </template>
  </USelectMenu>
</template>
