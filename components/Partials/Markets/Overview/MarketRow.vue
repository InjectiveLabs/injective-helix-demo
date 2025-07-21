<script setup lang="ts">
import { SharedMarketType, SharedMarketChange } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { MarketCyTags } from '@/types'
import type { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

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
      <p
        class="text-sm tracking-wide font-bold truncate min-w-0"
        :data-cy="dataCyTag(MarketCyTags.NewMarketsDenoms)"
      >
        {{ market.market.ticker }}
      </p>
    </div>
    <p class="flex flex-1 text-right text-xs">
      <SharedAmount
        v-bind="{
          useSubscript: true,
          shouldAbbreviate: false,
          decimals: market.market.priceDecimals,
          amount: market?.summary?.lastPrice || 0
        }"
      >
        <template #prefix>
          <span class="mr-1">$</span>
        </template>
      </SharedAmount>
    </p>
    <p
      class="flex flex-1 text-right text-xs justify-end"
      :class="priceChangeClasses"
    >
      <SharedAmount
        v-bind="{
          useSubscript: true,
          shouldAbbreviate: false,
          amount: market.summary.change,
          decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
        }"
      >
        <template #prefix>
          <span v-if="Number(market.summary.change) > 0">+</span>
        </template> </SharedAmount
      >%
    </p>
  </NuxtLink>
</template>
