<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { Change, TradeClickOrigin } from '@/types'
import { getAbbreviatedVolume, getMarketRoute } from '@/app/utils/market'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'

const appStore = useAppStore()

const props = defineProps({
  market: {
    type: Object as PropType<
      UiDerivativeMarketWithToken | UiSpotMarketWithToken
    >,
    required: true
  },

  summary: {
    type: Object as PropType<UiDerivativeMarketSummary | UiSpotMarketSummary>,
    required: true
  },

  volumeInUsd: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const lastTradedPrice = computed(() => {
  if (!props.summary || !props.summary.price) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.summary.lastPrice || props.summary.price)
})

const { valueToString: lastTradedPriceToFormat } = useBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces:
      props.market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
    displayAbsoluteDecimalPlace: true
  }
)

const quoteVolume = computed(() => {
  if (!props.summary || !props.summary.volume) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.summary.volume)
})

const { valueToString: quoteVolumeToFormat } = useBigNumberFormatter(
  quoteVolume,
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const volumeInUsdToFormat = computed(() => {
  return props.volumeInUsd.toFormat(2, BigNumberInBase.ROUND_DOWN)
})

const abbreviatedVolumeInUsdToFormat = computed(() => {
  return getAbbreviatedVolume(props.volumeInUsd)
})

const change = computed(() => {
  if (!props.summary || !props.summary.change) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.summary.change)
})

const { valueToString: changeToFormat } = useBigNumberFormatter(change, {
  decimalPlaces: 2,
  minimalDecimalPlaces: 4
})

const lastPriceChange = computed(() => {
  if (!props.summary) {
    return Change.NoChange
  }

  if (!props.summary.lastPriceChange) {
    return Change.NoChange
  }

  return props.summary.lastPriceChange
})

const marketRoute = computed(() => {
  const marketRoute = getMarketRoute(props.market)

  return marketRoute || { name: 'index' }
})

const isFavorite = computed(() => {
  return appStore.favoriteMarkets.includes(props.market.marketId)
})

function updateWatchList() {
  appStore.updateFavoriteMarkets(props.market.marketId)
}

function handleTradeClickedTrack() {
  amplitudeTracker.submitTradeClickedTrackEvent({
    market: props.market.slug,
    marketType: props.market.subType,
    origin: TradeClickOrigin.MarketsPage
  })
}
</script>

<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-10 3md:grid-cols-12 text-gray-200 gap-4 text-sm px-4 py-5 mb-1 items-center"
    :data-cy="`markets-table-row-${market.ticker}`"
  >
    <span class="text-sm col-span-2 sm:col-span-3 flex items-center gap-4">
      <div
        class="3md:hidden text-blue-500 mr-3 cursor-pointer"
        data-cy="markets-favourite-button"
        @click="updateWatchList"
      >
        <BaseIcon v-if="isFavorite" name="star" class="min-w-6 w-6 h-6" />
        <BaseIcon v-else name="star-border" class="min-w-6 w-6 h-6" />
      </div>

      <NuxtLink :to="marketRoute" class="w-full">
        <div
          class="cursor-pointer flex items-center"
          @click="handleTradeClickedTrack"
        >
          <CommonTokenIcon
            v-if="market.baseToken"
            :token="market.baseToken"
            class="mr-3 hidden 3md:block"
          />
          <div class="flex flex-col w-full overflow-hidden">
            <span
              class="tracking-wider font-bold mb-1 overflow-hidden overflow-ellipsis items-start"
              :title="market.ticker"
              data-cy="markets-ticker-name-table-data"
            >
              {{ market.ticker }}
            </span>
            <span class="text-gray-500 text-xs hidden md:block">
              {{ market.baseToken.name }}
            </span>
            <span class="text-gray-500 text-xs sm:hidden tracking-wide mt-1">
              {{ $t('markets.vol') }} {{ abbreviatedVolumeInUsdToFormat }} USD
            </span>
          </div>
          <PartialsCommonMarketAirdrop
            :market="market"
            class="visible sm:invisible lg:visible ml-auto"
          />
        </div>
      </NuxtLink>
    </span>

    <!-- Mobile column -->
    <div class="sm:hidden flex flex-col items-end font-mono">
      <div class="flex items-center">
        <span
          v-if="!lastTradedPrice.isNaN()"
          class=""
          :class="{
            'text-green-500': lastPriceChange === Change.Increase,
            'text-white': lastPriceChange === Change.NoChange,
            'text-red-500': lastPriceChange === Change.Decrease
          }"
        >
          {{ lastTradedPriceToFormat }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>

      <div v-if="!change.isNaN()" class="mt-1">
        <span :class="change.gte(0) ? 'text-green-500' : 'text-red-500'">
          {{ changeToFormat }}%
        </span>
      </div>
    </div>

    <span
      class="hidden font-mono sm:flex items-center justify-end col-span-2"
      data-cy="markets-last-traded-price-table-data"
    >
      <span
        v-if="!lastTradedPrice.isNaN()"
        :class="{
          'text-green-500': lastPriceChange === Change.Increase,
          'text-white': lastPriceChange === Change.NoChange,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
      </span>
      <span v-else class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden sm:block font-mono text-right col-span-2 text-sm">
      <span
        v-if="!change.isNaN()"
        data-cy="markets-change_24h-table-data"
        :class="{
          'text-green-500': change.gt(0),
          'text-white': change.eq(0),
          'text-red-500': change.lt(0)
        }"
      >
        {{ changeToFormat }}%
      </span>
      <span v-else class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden sm:block font-mono col-span-3">
      <div v-if="!quoteVolume.isNaN()" class="flex flex-col items-end">
        <span data-cy="markets-volume-usd-table-data" class="mb-1">
          {{ volumeInUsdToFormat }} USD
        </span>
        <span
          class="text-xs text-gray-500"
          data-cy="markets-volume-quote-asset-table-data"
        >
          {{ quoteVolumeToFormat }}
          <span>
            {{ market.quoteToken.symbol }}
          </span>
        </span>
      </div>
      <span v-else class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden 3md:flex col-span-2 items-center justify-end">
      <NuxtLink
        class="text-blue-500 hover:text-blue-600"
        data-cy="markets-trade-link"
        :to="marketRoute"
      >
        <div @click="handleTradeClickedTrack">
          {{ $t('trade.trade') }}
        </div>
      </NuxtLink>

      <div
        class="text-blue-500 w-6 h-6 flex items-center justify-center rounded-full ml-6 cursor-pointer hover:bg-blue-500 hover:bg-opacity-10"
        data-cy="markets-favorite-button"
        @click="updateWatchList"
      >
        <BaseIcon
          v-if="isFavorite"
          name="star"
          class="min-w-5 w-5 h-5"
          data-cy="markets-is-favorite-icon"
        />
        <BaseIcon
          v-else
          name="star-border"
          class="min-w-5 w-5 h-5"
          data-cy="markets-is-not-favorite-icon"
        />
      </div>
    </span>
  </div>
</template>
