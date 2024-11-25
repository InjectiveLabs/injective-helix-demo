<script setup lang="ts">
import { NuxtUiIcons, SharedMarketChange } from '@shared/types'
import { UiMarketWithToken } from '@/types'
import { stableCoinSymbols } from '~/app/data/token'

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {
    isSpot: false
  }
)

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

const lastTradedPriceInUsd = computed(() =>
  lastTradedPrice.value.times(tokenStore.tokenUsdPrice(props.market.quoteToken))
)

const isStableCoinMarket = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)
</script>

<template>
  <div class="flex-1 flex items-center justify-center">
    <CommonSkeletonNumber v-if="lastTradedPrice.eq(0)" />

    <div v-else class="flex items-center justify-center">
      <UIcon
        v-if="
          [SharedMarketChange.Increase, SharedMarketChange.Decrease].includes(
            lastTradedPriceChange
          )
        "
        :name="NuxtUiIcons.ArrowLeft"
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
        <AppAmount
          v-bind="{
            amount: lastTradedPrice.toFixed(),
            decimalPlaces: market.priceDecimals
          }"
        />
      </span>

      <span
        v-if="!isStableCoinMarket && isSpot"
        class="text-xs ml-1 text-coolGray-350 border-b border-dashed border-coolGray-400"
      >
        <AppAmount :amount="lastTradedPriceInUsd.toFixed()" />
        <span> USD</span>
      </span>

      <span v-if="!isSpot" class="text-xs ml-2">
        <CommonHeaderTooltip
          v-bind="{
            tooltip: $t('trade.markPrice')
          }"
        >
          <AppAmount
            v-bind="{
              amount: markPrice,
              decimalPlaces: market.priceDecimals
            }"
          />
        </CommonHeaderTooltip>
      </span>
    </div>
  </div>
</template>
