<script lang="ts" setup>
import { SharedUiMarketSummary } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UI_MINIMAL_ABBREVIATION_FLOOR,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { stableCoinDenoms } from '@/app/data/token'
import { getMarketRoute } from '@/app/utils/market'
import { MainPage, UiMarketWithToken, TradingBotsSubPage } from '@/types'

const appStore = useAppStore()

const props = defineProps({
  isGrid: Boolean,

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

const marketRoute = props.isGrid
  ? {
      to: TradingBotsSubPage.GridSpotMarket,
      params: { market: props.market.slug }
    }
  : getMarketRoute(props.market) || { name: MainPage.Markets }

const isFavorite = computed(() =>
  appStore.favoriteMarkets.includes(props.market.marketId)
)

const formatterOptions = computed(() =>
  stableCoinDenoms.includes(props.market.quoteToken.symbol)
    ? {
        decimalPlaces: 0,
        abbreviationFloor: UI_MINIMAL_ABBREVIATION_FLOOR
      }
    : {
        abbreviationFloor: undefined,
        decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
      }
)

const { valueToString: abbreviatedVolumeInUsdToFormat } =
  useSharedBigNumberFormatter(
    computed(() => props.volumeInUsd),
    formatterOptions.value
  )

function toggleFavoriteMarket() {
  appStore.toggleFavoriteMarket(props.market.marketId)
}
</script>

<template>
  <div
    class="flex justify-start text-gray-200 gap-4 text-xs px-3 py-2 bg-gray-900 items-center hover:bg-gray-850"
    :data-cy="`markets-table-row-${market.ticker}`"
  >
    <div
      class="text-gray-500 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-400 hover:text-gray-400 hover:bg-opacity-10 cursor-pointer"
      data-cy="markets-favorite-button"
      @click="toggleFavoriteMarket"
    >
      <SharedIcon
        v-if="isFavorite"
        name="star"
        class="min-w-5 w-5 h-5"
        data-cy="markets-is-favorite-icon"
      />
      <SharedIcon v-else name="star-border" class="min-w-5 w-5 h-5" />
    </div>

    <NuxtLink
      class="cursor-pointer flex items-center justify-between w-full"
      :to="marketRoute"
      data-cy="markets-trade-link"
    >
      <div class="flex flex-col">
        <span
          class="font-semibold text-gray-200"
          data-cy="markets-ticker-table-data"
        >
          {{ market.ticker }}
        </span>
        <span
          class="text-gray-500 tracking-wide mt-1 font-mono"
          data-cy="markets-volume_24h-table-data"
        >
          {{ abbreviatedVolumeInUsdToFormat }} USD
        </span>
      </div>

      <PartialsTradingMarketStatsPartialsLastTradedPriceAndChange
        v-bind="{
          ...$attrs,
          market,
          summary
        }"
      />
    </NuxtLink>
  </div>
</template>
