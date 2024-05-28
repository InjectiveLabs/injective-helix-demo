<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketQuoteType,
  MarketHeaderType,
  MarketTypeOption,
  MarketCategoryType,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'
import {
  marketIsActive,
  marketIsQuotePair,
  marketIsPartOfType,
  marketIsPartOfSearch,
  marketIsPartOfCategory
} from '@/app/utils/market'
import { LOW_VOLUME_MARKET_THRESHOLD } from '@/app/utils/constants'
import {
  upcomingMarkets,
  deprecatedMarkets,
  olpSlugsToIncludeInLowVolume
} from '@/app/data/market'

const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()

const activeTypeOptions = Object.values(MarketTypeOption)
  .filter(
    (marketType) =>
      ![MarketTypeOption.Permissionless /* MarketTypeOption.Themes */].includes(
        marketType
      )
  )
  .map((value) => ({
    label: `markets.${value}`,
    value
  }))

const activeCategoryOptions = Object.values(MarketCategoryType).map(
  (value) => ({ label: `markets.${value}`, value })
)

const search = ref('')
const isAscending = ref(false)
const sortBy = ref(MarketHeaderType.Volume)
const isLowVolumeMarketsVisible = ref(false)
const activeQuote = ref(MarketQuoteType.All)
const activeType = ref(MarketTypeOption.All)
const activeCategory = ref(MarketCategoryType.All)

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [...spotStore.marketsWithSummary, ...derivativeStore.marketsWithSummary].map(
    ({ market, summary }) => {
      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPrice(market.quoteToken)
      )

      return {
        market,
        summary,
        volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
      }
    }
  )
)

const filteredMarkets = computed(() =>
  marketsWithSummaryAndVolumeInUsd.value
    .filter(({ market, volumeInUsd }) => {
      const isPartOfCategory = marketIsPartOfCategory(
        activeCategory.value,
        market
      )
      const isPartOfSearch = marketIsPartOfSearch(search.value, market)
      const isPartOfType = marketIsPartOfType({
        market,
        favoriteMarkets: appStore.favoriteMarkets,
        activeType: activeType.value
      })
      const isQuotePair = marketIsQuotePair(activeQuote.value, market)
      const isOLPMarket = olpSlugsToIncludeInLowVolume.includes(market.slug)
      const isLowVolumeMarket =
        isLowVolumeMarketsVisible.value ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

      return (
        isPartOfCategory &&
        isPartOfType &&
        isPartOfSearch &&
        isQuotePair &&
        (isLowVolumeMarket || isOLPMarket || search.value)
      )
    })
    .filter((market) => marketIsActive(market.market))
)

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

      if (sortBy.value === MarketHeaderType.Price) {
        return new BigNumberInBase(m2.summary.price || 0).comparedTo(
          m1.summary.price || 0
        )
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

      return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
    }
  )

  return isAscending.value ? markets.reverse() : markets
})

function onSortBy(sortType: MarketHeaderType) {
  sortBy.value = sortType
}

function onAscending(ascending: boolean) {
  isAscending.value = ascending
}
</script>

<template>
  <div class="relative">
    <div class="z-10 sticky top-0 bg-brand-900 border-b">
      <div class="p-2 space-y-2">
        <div class="border-b py-2">
          <label class="flex rounded p-1">
            <div class="flex items-center text-gray-500">
              <SharedIcon name="search" />
            </div>
            <input
              id="search-market"
              v-model="search"
              v-focus
              placeholder="Search Market..."
              type="text"
              class="p-1 focus:outline-none placeholder:text-gray-600 flex-1 !bg-transparent"
              autocomplete="off"
            />
          </label>
        </div>

        <div
          class="flex max-md:flex-col max-md:items-start gap-2 justify-between"
        >
          <div class="flex gap-2 flex-wrap">
            <AppButtonSelect
              v-for="category in activeTypeOptions"
              :key="category.value"
              v-model="activeType"
              v-bind="{ value: category.value }"
              class="py-1 px-2 rounded text-xs bg-brand-850 tracking-wider capitalize text-gray-500"
              active-classes="text-white !bg-brand-700"
            >
              {{ category.value }}
            </AppButtonSelect>
          </div>

          <div class="flex overflow-hidden rounded border">
            <AppButtonSelect
              v-for="value in Object.values(MarketQuoteType)"
              :key="value"
              v-model="activeQuote"
              v-bind="{ value }"
              class="py-1 px-3 text-gray-400 text-xs uppercase hover:bg-brand-875"
              active-classes="text-white !bg-brand-800"
            >
              {{ value }}
            </AppButtonSelect>
          </div>
        </div>

        <div class="flex justify-between items-center flex-wrap">
          <div class="flex gap-2 flex-wrap justify-between">
            <AppButtonSelect
              v-for="category in activeCategoryOptions"
              :key="category.value"
              v-model="activeCategory"
              v-bind="{ value: category.value }"
              class="py-1 px-2 rounded text-xs bg-brand-850 tracking-wider capitalize text-gray-500"
              active-classes="text-white !bg-brand-700"
            >
              {{ category.value }}
            </AppButtonSelect>
          </div>

          <AppCheckbox2 v-model="isLowVolumeMarketsVisible">
            {{ $t('markets.showLowVol') }}
          </AppCheckbox2>
        </div>
      </div>
    </div>

    <div class="divide-y overflow-x-auto">
      <div class="min-w-[600px]">
        <PartialsMarketsCommonHeader
          v-bind="{ sortBy, isAscending }"
          @update:is-ascending="onAscending"
          @update:sort-by="onSortBy"
        />

        <PartialsMarketsCommonRow
          v-for="{ market, summary, volumeInUsd } in sortedMarkets"
          :key="market.marketId"
          v-bind="{ market, summary, volumeInUsd }"
        />
      </div>
    </div>
  </div>
</template>
