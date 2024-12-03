<script setup lang="ts">
import { NuxtUiIcons, SharedMarketChange } from '@shared/types'
import { stableCoinSymbols } from '~/app/data/token'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { UiMarketWithToken } from '@/types'

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
      <span
        class="text-sm tracking-wider font-bold spacing"
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
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />
      </span>

      <UIcon
        v-if="
          [SharedMarketChange.Increase, SharedMarketChange.Decrease].includes(
            lastTradedPriceChange
          )
        "
        :name="NuxtUiIcons.ArrowLeft"
        class="transform w-5 h-5 mx-2"
        :class="{
          'text-red-500 -rotate-90':
            lastTradedPriceChange === SharedMarketChange.Decrease,
          'text-green-500 rotate-90':
            lastTradedPriceChange === SharedMarketChange.Increase
        }"
      />

      <span
        v-if="!isStableCoinMarket && isSpot"
        class="text-sm text-coolGray-350 border-b border-dashed border-coolGray-400 tracking-wider"
      >
        <AppAmount :amount="lastTradedPriceInUsd.toFixed()" />
        <span> USD</span>
      </span>

      <span v-if="!isSpot" class="text-sm tracking-wider">
        <CommonHeaderTooltip
          v-bind="{
            tooltip: $t('trade.markPrice')
          }"
        >
          <AppAmount
            v-bind="{
              amount: markPrice,
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
        </CommonHeaderTooltip>
      </span>
    </div>
  </div>
</template>
