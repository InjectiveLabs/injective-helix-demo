<script lang="ts" setup>
import { PropType } from 'vue'
import {
  Change,
  UiSpotMarketSummary,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<UiSpotMarketSummary>,
    required: true
  }
})

const lastTradedPrice = computed(() => {
  if (!props.summary.price) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.summary.lastPrice || props.summary.price)
})

const { valueToString: lastTradedPriceToFormat } = useBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces:
      props.market.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const change = computed(() => {
  if (!props.summary.change) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.summary.change)
})

const { valueToString: changeToFormat } = useBigNumberFormatter(change)

const lastPriceChange = computed(() => {
  if (!props.summary.lastPriceChange) {
    return Change.NoChange
  }

  return props.summary.lastPriceChange
})
</script>

<template>
  <div
    class="rounded-lg bg-gray-750 p-4 flex flex-col gap-2"
    :to="{
      name: 'spot-spot',
      params: { spot: market.slug }
    }"
  >
    <span class="font-bold text-sm">
      {{ market.baseToken.symbol }}/{{ market.quoteToken.symbol }}
    </span>

    <div class="flex justify-between items-center">
      <span
        v-if="!lastTradedPrice.isNaN()"
        class="font-mono text-sm"
        :class="{
          'text-green-500': lastPriceChange === Change.Increase,
          'text-gray-350': lastPriceChange === Change.NoChange,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
      </span>
      <span v-else class="text-gray-350">&mdash;</span>

      <span
        v-if="!change.isNaN()"
        class="font-mono text-sm"
        :class="{
          'text-green-500': change.gt(0),
          'text-gray-350': change.eq(0),
          'text-red-500': change.lt(0)
        }"
      >
        {{ changeToFormat }}%
      </span>
      <span v-else class="font-mono text-sm text-gray-350">&mdash;</span>
    </div>
  </div>
</template>
