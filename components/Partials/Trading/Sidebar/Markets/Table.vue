<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { marketIsPartOfType, marketIsPartOfSearch } from '@/app/utils/market'
import {
  UiMarketWithToken,
  UiMarketAndSummaryWithVolumeInUsd,
  MarketTypeOption
} from '@/types'
import { GST_ROUTE, LOW_VOLUME_MARKET_THRESHOLD } from '@/app/utils/constants'
import { olpSlugsToIncludeInLowVolume } from '@/app/data/market'

enum SortableKeys {
  Market = 'market',
  Change = 'change',
  Volume = 'volume'
}

const appStore = useAppStore()

const props = defineProps({
  isGrid: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const route = useRoute()

const isSpot = (route.name as string).startsWith(GST_ROUTE)

const activeType = ref(
  props.isGrid ? (isSpot ? MarketType.Spot : MarketType.Futures) : ''
)
const search = ref('')
const isAscending = ref(false)
const sortBy = ref(SortableKeys.Volume)
const isLowVolumeMarketsVisible = ref(false)

const filteredMarkets = computed(() =>
  props.markets
    .filter(({ market, volumeInUsd }) => {
      const isPartOfSearch = marketIsPartOfSearch(search.value, market)
      const isPartOfType = marketIsPartOfType({
        market,
        favoriteMarkets: appStore.favoriteMarkets,
        activeType: activeType.value as MarketTypeOption
      })
      const isOLPMarket = olpSlugsToIncludeInLowVolume.includes(market.slug)
      const isLowVolumeMarket =
        isLowVolumeMarketsVisible.value ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

      return (
        isPartOfType && isPartOfSearch && (isLowVolumeMarket || isOLPMarket)
      )
    })
    .filter((m) => m.summary)
)

const sortedMarkets = computed(() => {
  if (sortBy.value.trim() === '') {
    return filteredMarkets.value
  }

  const markets = [...filteredMarkets.value].sort(
    (
      m1: UiMarketAndSummaryWithVolumeInUsd,
      m2: UiMarketAndSummaryWithVolumeInUsd
    ) => {
      if (sortBy.value === SortableKeys.Market) {
        return m2.market.ticker.localeCompare(m1.market.ticker)
      }

      if (sortBy.value === SortableKeys.Change) {
        if (new BigNumberInBase(m2.summary.change).eq(m1.summary.change)) {
          return m1.market.ticker.localeCompare(m2.market.ticker)
        }

        return new BigNumberInBase(m2.summary.change)
          .minus(m1.summary.change)
          .toNumber()
      }

      if (new BigNumberInBase(m2.volumeInUsd).eq(m1.volumeInUsd)) {
        return m1.market.ticker.localeCompare(m2.market.ticker)
      }

      // default: sort by volume
      return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
    }
  )

  return isAscending.value ? markets.reverse() : markets
})
</script>

<template>
  <div>
    <PartialsTradingSidebarMarketsFilter
      v-model:active-type="activeType"
      v-model:search="search"
      v-model:is-low-volume-markets-visible="isLowVolumeMarketsVisible"
      v-bind="{
        isGrid
      }"
      class="mb-2"
    />
    <CommonTableHeader classes="flex flex-wrap mb-2 max-3xl:px-0">
      <div class="flex items-center flex-1 text-2xs">
        <AppSortableHeaderItem
          v-model:sort-by="sortBy"
          v-model:isAscending="isAscending"
          :value="SortableKeys.Market"
        >
          <span class="text-gray-200 font-normal order-last whitespace-nowrap">
            {{ $t('trade.market') }} /
          </span>
        </AppSortableHeaderItem>

        <AppSortableHeaderItem
          v-model:sort-by="sortBy"
          v-model:isAscending="isAscending"
          data-cy="markets-volume_24h-table-header"
          :value="SortableKeys.Volume"
          icon-class="order-last"
        >
          <span class="text-gray-200 font-normal ml-1">
            {{ $t('trade.volume') }}
          </span>
        </AppSortableHeaderItem>
      </div>

      <div
        class="flex items-center justify-end lg:justify-start 2xl:justify-end flex-1 text-2xs whitespace-nowrap"
      >
        <span class="font-normal text-gray-200">
          {{ $t('trade.price') }} /
        </span>
        <AppSortableHeaderItem
          v-model:sort-by="sortBy"
          v-model:isAscending="isAscending"
          data-cy="markets-volume_24h-table-header"
          :value="SortableKeys.Change"
          icon-class="order-last"
        >
          <span class="text-gray-200 font-normal">
            {{ $t('trade.market_change_24h') }}
          </span>
        </AppSortableHeaderItem>
      </div>
    </CommonTableHeader>

    <CommonTableBody
      :is-empty="sortedMarkets.length === 0"
      class="rounded overflow-hidden"
    >
      <div v-if="isGrid || !activeType">
        <PartialsTradingSidebarMarketsRow
          v-for="(marketSummary, index) in sortedMarkets"
          v-bind="{
            ...$attrs,
            market: marketSummary.market,
            summary: marketSummary.summary,
            volumeInUsd: marketSummary.volumeInUsd,
            isCurrentMarket: market.marketId === marketSummary.market.marketId,
            isGrid
          }"
          :key="`market-row-${index}-${marketSummary.market.marketId}`"
        />
      </div>

      <PartialsTradingSidebarMarketsSpotPerpetualRows
        v-else
        v-bind="{ ...$attrs, isGrid, market, markets: sortedMarkets }"
      />

      <template #empty>
        <CommonEmptyList
          class="min-h-3xs bg-gray-900"
          data-cy="markets-no-data-table"
          :message="
            activeType === MarketType.Favorite
              ? $t('markets.emptyHeaderFavorites')
              : $t('markets.emptyHeader')
          "
        >
          <template #icon>
            <BaseIcon name="star-border" class="text-gray-500 w-8 h-8" />
          </template>

          <span
            v-if="activeType === MarketType.Favorite"
            class="mt-1 text-2xs text-gray-500 text-center"
          >
            {{ $t('markets.emptyDescriptionFavorites') }}
          </span>

          <span v-else class="mt-1 text-2xs text-gray-500 text-center">
            {{ $t('markets.emptyDescription') }}
          </span>
        </CommonEmptyList>
      </template>
    </CommonTableBody>
  </div>
</template>
