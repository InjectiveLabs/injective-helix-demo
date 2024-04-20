<script setup lang="ts">
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { Change, UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketAndSummaryWithVolumeInUsd>,
    required: true
  }
})

const { valueToString: priceToString } = useBigNumberFormatter(
  computed(() => props.market.summary.lastPrice),
  {
    decimalPlaces: props.market.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: priceChangeToString } = useBigNumberFormatter(
  computed(() => props.market.summary.change),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const to = computed(() =>
  props.market.market.type === MarketType.Spot
    ? { name: 'spot-slug', params: { slug: props.market.market.slug } }
    : { name: 'futures-slug', params: { slug: props.market.market.slug } }
)

const priceChangeClasses = computed(() => {
  if (props.market.summary.lastPriceChange === Change.NoChange) {
    return 'text-gray-350'
  }

  return props.market.summary.lastPriceChange === Change.Increase
    ? 'text-green-500'
    : 'text-red-500'
})
</script>

<template>
  <NuxtLink
    v-bind="{ to }"
    class="flex p-2 items-center space-x-2 rounded-md hover:bg-brand-800"
  >
    <div class="flex-[2] flex items-center space-x-2 overflow-hidden">
      <CommonTokenIcon v-bind="{ token: market.market.baseToken }" />
      <p class="font-semibold tracking-wider truncate min-w-0">
        {{ market.market.ticker }}
      </p>
    </div>
    <p class="flex-1 text-right font-mono text-sm">{{ priceToString }}</p>
    <p class="flex-1 text-right font-mono text-sm" :class="priceChangeClasses">
      <span v-if="Number(market.summary.change) > 0">+</span>
      <span>{{ priceChangeToString }}%</span>
    </p>
  </NuxtLink>
</template>
