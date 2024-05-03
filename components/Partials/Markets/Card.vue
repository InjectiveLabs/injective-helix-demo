<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketChange, SharedUiMarketSummary } from '@shared/types'
import { getMarketRoute } from '@/app/utils/market'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<SharedUiMarketSummary>,
    required: true
  },

  volumeInUsd: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const marketRoute = getMarketRoute(props.market)

const lastTradedPrice = computed(() => {
  if (!props.summary || !props.summary.price) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.summary.lastPrice || props.summary.price)
})

const change = computed(() => {
  if (!props.summary || !props.summary.change) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.summary.change)
})

const { valueToString: volumeInUsdToFormat } = useSharedBigNumberFormatter(
  computed(() => props.volumeInUsd),
  {
    decimalPlaces: 2
  }
)

const { valueToString: lastTradedPriceToFormat } = useSharedBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces:
      props.market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: changeToFormat } = useSharedBigNumberFormatter(change, {
  decimalPlaces: 2
})
</script>

<template>
  <NuxtLink
    :to="marketRoute"
    class="rounded-lg shadow-card p-4 bg-gray-750 bg-opacity-30 block cursor-pointer"
  >
    <div class="flex items-center justify-between text-gray-500">
      <p class="tracking-widest uppercase text-xs">
        <slot />
      </p>
    </div>
    <div class="flex justify-between mt-4">
      <div class="flex items-center">
        <div v-if="market.baseToken" class="w-8 h-8 mr-3">
          <CommonTokenIcon
            :token="market.baseToken"
            class="min-w-full h-auto rounded-full"
            is-lg
          />
        </div>
        <div class="flex flex-col">
          <p
            data-cy="market-card-ticker-text-content"
            class="uppercase tracking-widest text-sm font-bold leading-4"
          >
            {{ market.ticker }}
          </p>
          <span class="text-xs text-gray-500 capitalize">
            {{ market.baseToken.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-start mt-4">
      <p
        class="text-xl tracking-wide font-mono font-semibold flex items-center mr-2"
        data-cy="market-card-last-traded-price-text-content"
        :class="{
          'text-green-500 ':
            summary.lastPriceChange === SharedMarketChange.Increase,
          'text-white': summary.lastPriceChange === SharedMarketChange.NoChange,
          'text-red-500':
            summary.lastPriceChange === SharedMarketChange.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
      </p>

      <span
        class="text-sm font-mono"
        data-cy="market-card-change_24h-text-content"
        :class="{
          'text-green-500': change.gt(0),
          'text-white': change.eq(0),
          'text-red-500': change.lt(0)
        }"
      >
        {{ changeToFormat }}%
      </span>
    </div>

    <span
      class="text-gray-500 w-full text-sm"
      data-cy="market-card-volume-usd-text-content"
    >
      {{ $t('markets.vol') }}
      <span class="font-mono">{{ volumeInUsdToFormat }}</span> USD
    </span>
  </NuxtLink>
</template>
