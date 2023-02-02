<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiMarketWithToken, UiMarketSummary } from '@/types'
import { getMarketRoute } from '@/app/utils/market'
import { marketStableCoinQuoteSymbols } from '~~/app/data/market'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '~~/app/utils/constants'

const appStore = useAppStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<UiMarketSummary>,
    required: true
  },

  volumeInUsd: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const marketRoute = getMarketRoute(props.market) || { name: 'markets' }

const isFavorite = computed(() => {
  return appStore.favoriteMarkets.includes(props.market.marketId)
})

const formatterOptions = computed(() => {
  return marketStableCoinQuoteSymbols.includes(props.market.quoteToken.symbol)
    ? {
        decimalPlaces: 0,
        abbreviationFloor: UI_MINIMAL_ABBREVIATION_FLOOR
      }
    : {
        abbreviationFloor: undefined,
        decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
      }
})

const { valueToString: abbreviatedVolumeInUsdToFormat } = useBigNumberFormatter(
  computed(() => props.volumeInUsd),
  formatterOptions.value
)

function updateWatchList() {
  appStore.updateFavoriteMarkets(props.market.marketId)
}

function handleClickEvent() {
  emit('close')
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
      @click="updateWatchList"
    >
      <BaseIcon
        v-if="isFavorite"
        name="star"
        class="min-w-5 w-5 h-5"
        data-cy="markets-is-favorite-icon"
      />
      <BaseIcon v-else name="star-border" class="min-w-5 w-5 h-5" />
    </div>

    <NuxtLink
      class="cursor-pointer flex items-center justify-between w-full"
      :to="marketRoute"
      data-cy="markets-trade-link"
      @click="handleClickEvent"
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
        :market="market"
        :summary="summary"
      />
    </NuxtLink>
  </div>
</template>
