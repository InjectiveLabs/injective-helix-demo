<script setup lang="ts">
import { SharedMarketChange } from '@shared/types'
import { usdtToken } from '@shared/data/token'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const tokenStore = useTokenStore()

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

const { valueToString: lastPriceInUsdToString } = useSharedBigNumberFormatter(
  computed(() =>
    lastTradedPrice.value.times(
      tokenStore.tokenUsdPrice(props.market.quoteToken)
    )
  ),
  {
    decimalPlaces: computed(() => {
      return sharedGetExactDecimalsFromNumber(
        lastTradedPrice.value
          .times(tokenStore.tokenUsdPrice(props.market.quoteToken))
          .toFixed(props.market.priceDecimals)
      )
    }),
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: lastTradedPriceToString } = useSharedBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: markPriceToString } = useSharedBigNumberFormatter(
  computed(() => markPrice.value),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const isNonUsdtQuoteAsset = computed(() => {
  return props.market.quoteToken.denom !== usdtToken.denom
})
</script>

<template>
  <div class="flex-1 flex items-center justify-center">
    <CommonSkeletonNumber v-if="lastTradedPrice.eq(0)" />

    <div v-else class="flex items-center justify-center">
      <SharedIcon
        v-if="
          [SharedMarketChange.Increase, SharedMarketChange.Decrease].includes(
            lastTradedPriceChange
          )
        "
        name="arrow"
        class="transform w-3 h-3 lg:w-4 lg:h-4 4xl:w-5 4xl:h-5"
        :class="{
          'text-red-500 -rotate-90':
            lastTradedPriceChange === SharedMarketChange.Decrease,
          'text-green-500 rotate-90':
            lastTradedPriceChange === SharedMarketChange.Increase
        }"
      />

      <span
        class="text-xl font-semibold"
        :class="{
          'text-red-500 ':
            lastTradedPriceChange === SharedMarketChange.Decrease,
          'text-green-500 ':
            lastTradedPriceChange === SharedMarketChange.Increase
        }"
      >
        {{ lastTradedPriceToString }}
      </span>

      <span v-if="isNonUsdtQuoteAsset" class="mx-2 text-xs text-gray-400">
        ${{ lastPriceInUsdToString }}
      </span>

      <span v-if="!isSpot" class="text-xs ml-2">
        <CommonHeaderTooltip v-bind="{ tooltip: 'Mark Price' }">
          {{ markPriceToString }}
        </CommonHeaderTooltip>
      </span>
    </div>
  </div>
</template>
