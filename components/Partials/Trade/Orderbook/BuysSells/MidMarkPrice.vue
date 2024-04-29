<script setup lang="ts">
import { Change, UiMarketWithToken } from '~/types'

const props = defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const {
  lastTradedPrice: spotLastTradedPrice,
  lastTradedPriceChange: spotLastTradedPriceChange
} = useSpotLastPrice(computed(() => props.market))

const {
  markPrice,
  lastTradedPrice: derivativeLastTradedPrice,
  lastTradedPriceChange: derivativeLastTradedPriceChange
} = useDerivativeLastPrice(computed(() => props.market))

const lastTradedPriceChange = computed(() =>
  props.isSpot
    ? spotLastTradedPriceChange.value
    : derivativeLastTradedPriceChange.value
)

const lastTradedPrice = computed(() =>
  props.isSpot ? spotLastTradedPrice.value : derivativeLastTradedPrice.value
)

const { valueToString: lastTradedPriceToString } = useBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: markPriceToString } = useBigNumberFormatter(
  computed(() => markPrice.value),
  {
    decimalPlaces: props.market.priceDecimals
  }
)
</script>

<template>
  <div class="flex-1 flex items-center justify-center">
    <CommonSkeletonNumber v-if="lastTradedPrice.eq(0)" />

    <div v-else class="flex items-center justify-center">
      <BaseIcon
        v-if="
          [Change.Increase, Change.Decrease].includes(lastTradedPriceChange)
        "
        name="arrow"
        class="transform w-3 h-3 lg:w-4 lg:h-4 4xl:w-5 4xl:h-5"
        :class="{
          'text-red-500 -rotate-90': lastTradedPriceChange === Change.Decrease,
          'text-green-500 rotate-90': lastTradedPriceChange === Change.Increase
        }"
      />
      <span
        class="text-xl font-semibold"
        :class="{
          'text-red-500 ': lastTradedPriceChange === Change.Decrease,
          'text-green-500 ': lastTradedPriceChange === Change.Increase
        }"
      >
        {{ lastTradedPriceToString }}
      </span>
      <span v-if="!isSpot" class="text-xs ml-2">
        <CommonHeaderTooltip v-bind="{ tooltip: 'Mark Price' }">
          {{ markPriceToString }}
        </CommonHeaderTooltip>
      </span>
    </div>
  </div>
</template>
