<script setup lang="ts">
import { SharedMarketType, SharedMarketChange } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketAndSummaryWithVolumeInUsd
  }>(),
  {}
)

const to = computed(() =>
  props.market.market.type === SharedMarketType.Spot
    ? { name: 'spot-slug', params: { slug: props.market.market.slug } }
    : { name: 'futures-slug', params: { slug: props.market.market.slug } }
)

const priceChangeClasses = computed(() => {
  if (props.market.summary.lastPriceChange === SharedMarketChange.NoChange) {
    return 'text-coolGray-350'
  }

  return props.market.summary.lastPriceChange === SharedMarketChange.Increase
    ? 'text-green-500'
    : 'text-red-500'
})
</script>

<template>
  <NuxtLink
    v-bind="{ to }"
    class="flex p-2 items-center space-x-2 rounded-md hover:bg-brand-800"
  >
    <div class="flex-[3] flex items-center space-x-3 overflow-hidden">
      <CommonTokenIcon v-bind="{ token: market.market.baseToken }" />
      <p class="text-sm tracking-wide font-bold truncate min-w-0">
        {{ market.market.ticker }}
      </p>
    </div>
    <p class="flex flex-1 text-right font-mono text-xs">
      <span class="mr-1">$</span>
      <AppAmount
        v-bind="{
          amount: market?.summary?.lastPrice || 0,
          decimalPlaces: market.market.priceDecimals
        }"
      />
    </p>
    <p
      class="flex flex-1 text-right font-mono text-xs justify-end"
      :class="priceChangeClasses"
    >
      <span v-if="Number(market.summary.change) > 0">+</span>
      <AppAmount
        v-bind="{
          amount: market.summary.change,
          decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
        }"
      />
      %
    </p>
  </NuxtLink>
</template>
