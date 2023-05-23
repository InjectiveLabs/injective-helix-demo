<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import {
  MarketCategoryType,
  MarketQuoteType,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'
import {
  marketIsPartOfCategory,
  marketIsQuotePair,
  marketIsPartOfType,
  marketIsPartOfSearch
} from '@/app/utils/market'
import {
  deprecatedMarkets,
  dmmSlugsToIncludeInLowVolume,
  upcomingMarkets
} from '@/app/data/market'
import { LOW_VOLUME_MARKET_THRESHOLD } from '@/app/utils/constants'

enum MarketHeaderType {
  Market = 'market',
  Change = 'change',
  Volume = 'volume'
}

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const route = useRoute()
const appStore = useAppStore()
const derivativeStore = useDerivativeStore()

const activeCategory = ref(MarketCategoryType.All)
const activeQuote = ref(MarketQuoteType.All)
const activeType = ref('')
const search = ref('')
const sortBy = ref(MarketHeaderType.Volume)
const ascending = ref(false)
const showLowVolumeMarkets = ref(false)

const recentlyExpiredMarkets = computed(
  () => derivativeStore.recentlyExpiredMarkets
)

const favoriteMarkets = computed(() => appStore.favoriteMarkets)

const filteredMarkets = computed(() => {
  return props.markets.filter(({ market, volumeInUsd }) => {
    const isPartOfCategory = marketIsPartOfCategory(
      activeCategory.value,
      market
    )
    const isPartOfSearch = marketIsPartOfSearch(search.value, market)
    const isPartOfType = marketIsPartOfType({
      market,
      favoriteMarkets: favoriteMarkets.value,
      activeType: activeType.value as MarketType
    })
    const isQuotePair = marketIsQuotePair(activeQuote.value, market)
    const isDmmMarket = dmmSlugsToIncludeInLowVolume.includes(market.slug)
    const isLowVolumeMarket = search.value
      ? true
      : showLowVolumeMarkets.value ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

    return (
      isPartOfCategory &&
      isPartOfType &&
      isPartOfSearch &&
      isQuotePair &&
      (isLowVolumeMarket || isDmmMarket)
    )
  })
})

const sortedMarkets = computed(() => {
  const upcomingMarketsSlugs = upcomingMarkets.map(({ slug }) => slug)
  const deprecatedMarketsSlugs = deprecatedMarkets.map(({ slug }) => slug)

  if (sortBy.value.trim() === '') {
    return filteredMarkets.value
  }

  const markets = [...filteredMarkets.value].sort(
    (
      m1: UiMarketAndSummaryWithVolumeInUsd,
      m2: UiMarketAndSummaryWithVolumeInUsd
    ) => {
      if (
        upcomingMarketsSlugs.includes(m1.market.slug) ||
        deprecatedMarketsSlugs.includes(m1.market.slug)
      ) {
        return 1
      }

      if (sortBy.value === MarketHeaderType.Market) {
        return m2.market.ticker.localeCompare(m1.market.ticker)
      }

      if (sortBy.value === MarketHeaderType.Change) {
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

  return ascending.value ? markets.reverse() : markets
})

onMounted(() => {
  prefillFromQueryParams()
})

function handleSort(value: string) {
  if (value !== sortBy.value) {
    sortBy.value = value as MarketHeaderType
  }
}

function handleAscending(value: boolean) {
  ascending.value = value
}

function prefillFromQueryParams() {
  const { query } = route

  const category = (
    typeof query.category === 'string'
      ? query.category.trim().toLowerCase()
      : query.category
  ) as MarketCategoryType

  const quote = (
    typeof query.quote === 'string'
      ? query.quote.trim().toLowerCase()
      : query.quote
  ) as MarketQuoteType

  const type = (
    typeof query.type === 'string'
      ? query.type.trim().toLowerCase()
      : query.type
  ) as MarketType

  if (quote && Object.values(MarketQuoteType).includes(quote)) {
    activeQuote.value = quote
  }

  if (category && Object.values(MarketCategoryType).includes(category)) {
    activeCategory.value = category
  }

  if (type && MarketType.Favorite.toLowerCase() === type) {
    activeType.value = MarketType.Favorite
  }

  if (type && MarketType.Spot.toLowerCase() === type) {
    activeType.value = MarketType.Spot
  }

  if (type && [MarketType.Perpetual.toLowerCase(), 'perp'].includes(type)) {
    activeType.value = MarketType.Perpetual
  }
}
</script>

<template>
  <div class="xl:max-w-6xl mx-auto py-6 md:py-12">
    <div>
      <h3 class="text-xl tracking-wider leading-6 font-bold md:hidden mb-6">
        {{ $t('markets.title') }}
      </h3>

      <PartialsMarketsFilters
        v-model:active-category="activeCategory"
        v-model:active-quote="activeQuote"
        v-model:active-type="activeType"
        v-model:show-low-volume-markets="showLowVolumeMarkets"
        v-model:search="search"
      />

      <!-- mobile header -->
      <CommonTableHeader classes="grid grid-cols-3 md:hidden">
        <AppSortableHeaderItem
          class="select-none"
          :value="MarketHeaderType.Market"
          :sort-by="sortBy"
          :ascending="ascending"
          @update:sort-by="handleSort"
          @update:ascending="handleAscending"
        >
          <span class="text-gray-200 text-2xs font-normal">
            {{ $t('trade.market') }}
          </span>
        </AppSortableHeaderItem>

        <AppSortableHeaderItem
          class="justify-end col-span-2 select-none"
          :value="MarketHeaderType.Change"
          :sort-by="sortBy"
          :ascending="ascending"
          @update:sort-by="handleSort"
          @update:ascending="handleAscending"
        >
          <template #prefix>
            <span class="text-gray-200 text-xs mr-1">
              {{ $t('trade.last_price') }} /
            </span>
          </template>

          <span class="text-gray-200 text-2xs font-normal">
            {{ $t('trade.market_change_24h') }}
          </span>
        </AppSortableHeaderItem>
      </CommonTableHeader>

      <CommonTableHeader class="grid-cols-10 3md:grid-cols-12">
        <AppSortableHeaderItem
          class="col-span-3 select-none"
          :value="MarketHeaderType.Market"
          :sort-by="sortBy"
          :ascending="ascending"
          @update:sort-by="handleSort"
          @update:ascending="handleAscending"
        >
          <span
            class="text-gray-200 text-2xs font-normal"
            data-cy="markets-market-table-header"
          >
            {{ $t('trade.market') }}
          </span>
        </AppSortableHeaderItem>

        <span class="text-right col-span-2">
          <span class="text-gray-200 text-2xs font-normal">
            {{ $t('trade.last_price') }}
          </span>
        </span>

        <AppSortableHeaderItem
          class="col-span-2 flex justify-end items-center select-none"
          :value="MarketHeaderType.Change"
          :sort-by="sortBy"
          :ascending="ascending"
          @update:sort-by="handleSort"
          @update:ascending="handleAscending"
        >
          <span
            class="text-gray-200 text-2xs font-normal"
            data-cy="markets-change_24h-table-header"
          >
            {{ $t('trade.market_change_24h') }}
          </span>
        </AppSortableHeaderItem>

        <AppSortableHeaderItem
          class="col-span-3 flex justify-end items-center select-none"
          :value="MarketHeaderType.Volume"
          :sort-by="sortBy"
          :ascending="ascending"
          @update:sort-by="handleSort"
          @update:ascending="handleAscending"
        >
          <span
            class="text-gray-200 text-2xs font-normal"
            data-cy="markets-volume_24h-table-header"
          >
            {{ $t('trade.volume_24h') }}
          </span>
        </AppSortableHeaderItem>
        <span class="hidden 3md:block text-left col-span-2" />
      </CommonTableHeader>

      <CommonTableBody
        :show-empty="sortedMarkets.length === 0"
        class="bg-transparent"
      >
        <PartialsMarketsRow
          v-for="({ market, summary, volumeInUsd }, index) in sortedMarkets"
          :key="`market-row-${market.marketId}-${index}`"
          :market="market"
          :summary="summary"
          :volume-in-usd="volumeInUsd"
        />

        <template #empty>
          <CommonEmptyList
            class="min-h-3xs"
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
              class="mt-2 text-xs text-gray-500"
            >
              {{ $t('markets.emptyDescriptionFavorites') }}
            </span>

            <span v-else class="mt-2 text-xs text-gray-500">
              {{ $t('markets.emptyDescription') }}
            </span>
          </CommonEmptyList>
        </template>
      </CommonTableBody>
    </div>
    <div v-if="recentlyExpiredMarkets.length > 0" class="mt-12">
      <h3 class="text-sm tracking-wider leading-6 mb-4">
        {{ $t('markets.expiredRecently') }}
      </h3>

      <PartialsMarketsExpired :markets="recentlyExpiredMarkets" />
    </div>
  </div>
</template>
