<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketStatus, SharedUiMarketSummary } from '@shared/types'
import { getMarketRoute } from '@/app/utils/market'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
import { TradeClickOrigin, UiMarketWithToken } from '@/types'

const appStore = useAppStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<SharedUiMarketSummary>,
    default: undefined
  },

  volumeInUsd: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const marketRoute = getMarketRoute(props.market)

const isFavorite = computed(() =>
  appStore.favoriteMarkets.includes(props.market.marketId)
)

function toggleFavoriteMarket() {
  appStore.toggleFavoriteMarket(props.market.marketId)
}

function tradeClickedTrack() {
  mixpanelAnalytics.trackNavigateToTradePage({
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
        data-cy="markets-favorite-button"
        @click="toggleFavoriteMarket"
      >
        <BaseIcon v-if="isFavorite" name="star" class="min-w-6 w-6 h-6" />
        <BaseIcon v-else name="star-border" class="min-w-6 w-6 h-6" />
      </div>

      <NuxtLink :to="marketRoute" class="w-full cursor-pointer">
        <div
          class="cursor-pointer flex items-center"
          @click="tradeClickedTrack"
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
          </div>
          <PartialsCommonMarketInactive
            v-if="market.marketStatus === SharedMarketStatus.Paused"
            class="visible sm:invisible lg:visible ml-auto"
          />
        </div>
      </NuxtLink>
    </span>

    <!-- Mobile column -->
    <div class="sm:hidden flex flex-col items-end font-mono">
      <div class="flex items-center">
        <span class="text-gray-400">&mdash;</span>
      </div>
    </div>

    <span
      class="hidden font-mono sm:flex items-center justify-end col-span-2"
      data-cy="markets-last-traded-price-table-data"
    >
      <span class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden sm:block font-mono text-right col-span-2 text-sm">
      <span class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden sm:block font-mono col-span-3 text-right">
      <span class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden 3md:flex col-span-2 items-center justify-end">
      <NuxtLink
        :to="marketRoute"
        class="text-blue-500 hover:text-blue-600 cursor-pointer"
        data-cy="markets-trade-link"
      >
        <div @click.stop="tradeClickedTrack">
          {{ $t('trade.trade') }}
        </div>
      </NuxtLink>

      <div
        class="text-blue-500 w-6 h-6 flex items-center justify-center rounded-full ml-6 cursor-pointer hover:bg-blue-500 hover:bg-opacity-10"
        data-cy="markets-favorite-button"
        @click="toggleFavoriteMarket"
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
