<script lang="ts" setup>
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  decimalPlaces: {
    type: Number,
    required: true
  }
})

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const { valueToString: lastTradePriceToString } = useSharedBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces: props.decimalPlaces,
    displayAbsoluteDecimalPlace: true
  }
)
</script>

<template>
  <div class="mb-4">
    <p class="text-sm">{{ $t('liquidity.currentPrice') }}</p>
    <p class="text-xl font-semibold">
      {{ lastTradePriceToString }}
    </p>
    <p class="text-gray-500 text-xs">
      {{ market.quoteToken.symbol }} per {{ market.baseToken.symbol }}
    </p>
  </div>
</template>
