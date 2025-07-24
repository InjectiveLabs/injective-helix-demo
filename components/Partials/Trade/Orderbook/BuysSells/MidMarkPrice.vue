<script setup lang="ts">
import { NuxtUiIcons, SharedMarketChange } from '@shared/types'
import { stableCoinSymbols } from '@/app/data/token'
import { SpotMarketCyTags } from '@/types'
import type { UiMarketWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {
    isSpot: false
  }
)

const sharedTokenStore = useSharedTokenStore()

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
  lastTradedPrice.value.times(
    sharedTokenStore.tokenUsdPrice(props.market.quoteToken)
  )
)

const isStableCoinMarket = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)
</script>

<template>
  <div class="flex-1 flex items-center justify-center">
    <CommonSkeletonNumber v-if="lastTradedPrice.eq(0)" />

    <div v-else class="flex items-center justify-center space-x-2">
      <span
        class="text-sm tracking-wider font-bold spacing"
        :class="{
          'text-red-500 ':
            lastTradedPriceChange === SharedMarketChange.Decrease,
          'text-green-500 ':
            lastTradedPriceChange === SharedMarketChange.Increase
        }"
      >
        <SharedAmount
          v-bind="{
            useSubscript: true,
            noTrailingZeros: false,
            shouldAbbreviate: false,
            decimals: market.priceDecimals,
            amount: lastTradedPrice.toFixed()
          }"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderbookMidMarkPrice)"
        />
      </span>

      <UIcon
        v-if="
          [SharedMarketChange.Increase, SharedMarketChange.Decrease].includes(
            lastTradedPriceChange
          )
        "
        :name="NuxtUiIcons.ArrowLeft"
        class="transform w-5 h-5"
        :class="{
          'text-red-500 -rotate-90':
            lastTradedPriceChange === SharedMarketChange.Decrease,
          'text-green-500 rotate-90':
            lastTradedPriceChange === SharedMarketChange.Increase
        }"
      />

      <span
        v-if="!isStableCoinMarket && isSpot"
        class="flex items-center text-sm text-coolGray-350 border-b border-dashed border-coolGray-400 tracking-wider"
      >
        <SharedAmountUsd
          v-bind="{
            amount: lastTradedPriceInUsd.toFixed()
          }"
        />
        <span class="ml-1"> USD</span>
      </span>

      <span v-if="!isSpot" class="text-sm tracking-wider">
        <CommonHeaderTooltip
          v-bind="{
            tooltip: $t('trade.markPrice')
          }"
        >
          <SharedAmount
            v-bind="{
              amount: markPrice,
              useSubscript: true,
              noTrailingZeros: false,
              shouldAbbreviate: false,
              decimals: market.priceDecimals
            }"
            :data-cy="dataCyTag(SpotMarketCyTags.OrderbookMarkPrice)"
          />
        </CommonHeaderTooltip>
      </span>
    </div>
  </div>
</template>
