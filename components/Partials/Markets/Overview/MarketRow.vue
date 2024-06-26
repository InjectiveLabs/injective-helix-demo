<script setup lang="ts">
import { SharedMarketType, SharedMarketChange } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketAndSummaryWithVolumeInUsd>,
    required: true
  }
})

const { valueToString: priceToString } = useSharedBigNumberFormatter(
  computed(() => props.market.summary.lastPrice || 0),
  {
    decimalPlaces: props.market.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: priceChangeToString } = useSharedBigNumberFormatter(
  computed(() => props.market.summary.change),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const to = computed(() =>
  props.market.market.type === SharedMarketType.Spot
    ? { name: 'spot-slug', params: { slug: props.market.market.slug } }
    : { name: 'futures-slug', params: { slug: props.market.market.slug } }
)

const priceChangeClasses = computed(() => {
  if (props.market.summary.lastPriceChange === SharedMarketChange.NoChange) {
    return 'text-gray-350'
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
    <div class="flex-[2] flex items-center space-x-2 overflow-hidden">
      <CommonTokenIcon v-bind="{ token: market.market.baseToken }" is-sm />
      <p class="text-sm tracking-wide truncate min-w-0">
        {{ market.market.ticker }}
      </p>
    </div>
    <p class="flex-1 text-right font-mono text-xs">${{ priceToString }}</p>
    <p class="flex-1 text-right font-mono text-xs" :class="priceChangeClasses">
      <span v-if="Number(market.summary.change) > 0">+</span>
      <span>{{ priceChangeToString }}%</span>
    </p>
  </NuxtLink>
</template>
