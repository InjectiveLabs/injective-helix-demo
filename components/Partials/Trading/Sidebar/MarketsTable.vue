<script lang="ts" setup>
import { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { marketIsPartOfType, marketIsPartOfSearch } from '@/app/utils/market'
import { UiMarketAndSummaryWithVolumeInUsd, UiMarketWithToken } from '@/types'

enum SortableKeys {
  Market = 'market',
  Volume = 'volume'
}

const appStore = useAppStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const activeType = ref('')
const search = ref('')
const ascending = ref(false)
const sortBy = ref(SortableKeys.Volume)

const filteredMarkets = computed(() => {
  return props.markets.filter(({ market }) => {
    const isPartOfSearch = marketIsPartOfSearch(search.value, market)
    const isPartOfType = marketIsPartOfType({
      market,
      favoriteMarkets: appStore.favoriteMarkets,
      activeType: activeType.value as MarketType
    })

    return isPartOfType && isPartOfSearch
  })
})

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

      if (new BigNumberInBase(m2.volumeInUsd).eq(m1.volumeInUsd)) {
        return m1.market.ticker.localeCompare(m2.market.ticker)
      }

      // default: sort by volume
      return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
    }
  )

  return ascending.value ? markets.reverse() : markets
})
</script>

<template>
  <div>
    <PartialsTradingSidebarMarketsFilter
      v-model:active-type="activeType"
      v-model:search="search"
      class="mb-2"
    />

    <CommonTableHeader classes="flex flex-wrap mb-2">
      <div class="flex items-center flex-1">
        <AppSortableHeaderItem
          v-model:sort-by="sortBy"
          v-model:ascending="ascending"
          :value="SortableKeys.Market"
        >
          <span
            class="text-gray-200 text-xs font-normal order-last whitespace-nowrap"
          >
            {{ $t('trade.market') }} /
          </span>
        </AppSortableHeaderItem>

        <AppSortableHeaderItem
          v-model:sort-by="sortBy"
          v-model:ascending="ascending"
          data-cy="markets-volume_24h-table-header"
          :value="SortableKeys.Volume"
        >
          <span class="text-gray-200 text-xs font-normal order-last">
            {{ $t('trade.volume') }}
          </span>
        </AppSortableHeaderItem>
      </div>

      <div class="flex items-center justify-end flex-1">
        <span class="font-normal text-gray-200 text-xs">
          {{ $t('trade.price') }} / {{ $t('trade.market_change') }}
        </span>
      </div>
    </CommonTableHeader>

    <CommonTableBody
      :show-empty="sortedMarkets.length === 0"
      class="rounded overflow-hidden"
    >
      <PartialsTradingSidebarMarketsTableRow
        v-for="(marketSummary, index) in sortedMarkets"
        v-bind="{
          ...$attrs,
          market: marketSummary.market,
          summary: marketSummary.summary,
          volumeInUsd: marketSummary.volumeInUsd,
          inCurrentMarket: market.marketId === marketSummary.market.marketId
        }"
        :key="`market-row-${index}-${marketSummary.market.marketId}`"
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
