<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketType, SharedMarketStatus } from '@shared/types'
import { marketCategoriesMap } from '@/app/json'
import { LOW_VOLUME_MARKET_THRESHOLD } from '@/app/utils/constants'
import { upcomingMarkets, deprecatedMarkets } from '@/app/data/market'
import {
  MarketHeaderType,
  UiMarketWithToken,
  MarketCategoryType,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

const appStore = useAppStore()

const props = withDefaults(
  defineProps<{
    search?: string
    activeCategory: MarketCategoryType
    isLowVolumeMarketsVisible?: boolean
    markets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {
    search: '',
    markets: () => [],
    activeCategory: MarketCategoryType.All
  }
)

const isAscending = ref(false)
const sortBy = ref(MarketHeaderType.Volume)

const filteredMarkets = computed(() =>
  props.markets
    .filter(({ market, volumeInUsd }) => {
      const formattedSearch = props.search.trim().toLowerCase()

      if (formattedSearch) {
        const isDeprecatedMarket = (
          marketCategoriesMap.deprecated || []
        ).includes(market.marketId)

        if (isDeprecatedMarket) {
          return market.ticker.toLowerCase() === formattedSearch
        }

        return [
          market.ticker,
          market.baseToken.name,
          market.baseToken.symbol,
          market.quoteToken.symbol
        ]
          .map((piece) => piece.toLowerCase())
          .some((value) => value.startsWith(formattedSearch))
      }

      const isPartOfCategory = verifyMarketIsPartOfType(market)
      const isLowVolumeMarket =
        props.isLowVolumeMarketsVisible ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

      return isPartOfCategory && isLowVolumeMarket
    })
    .filter(
      (market) => market.market.marketStatus === SharedMarketStatus.Active
    )
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

function verifyMarketIsPartOfType(market: UiMarketWithToken) {
  if (props.activeCategory === MarketCategoryType.All) {
    return true
  }

  if (props.activeCategory === MarketCategoryType.Favorites) {
    return appStore.favoriteMarkets.includes(market.marketId)
  }

  if (props.activeCategory === MarketCategoryType.Perps) {
    return [
      SharedMarketType.Futures,
      SharedMarketType.Perpetual,
      SharedMarketType.Derivative
    ].includes(market.type)
  }

  if (props.activeCategory === MarketCategoryType.Spot) {
    return market.type === SharedMarketType.Spot
  }

  if (props.activeCategory === MarketCategoryType.Trending) {
    return (marketCategoriesMap.trending || []).includes(market.marketId)
  }

  if (props.activeCategory === MarketCategoryType.Injective) {
    return (marketCategoriesMap.injective || []).includes(market.marketId)
  }

  if (props.activeCategory === MarketCategoryType.Layer1) {
    return (marketCategoriesMap.layer1 || []).includes(market.marketId)
  }

  if (props.activeCategory === MarketCategoryType.Layer2) {
    return (marketCategoriesMap.layer2 || []).includes(market.marketId)
  }

  if (props.activeCategory === MarketCategoryType.Experimental) {
    return (
      !market.isVerified &&
      !(marketCategoriesMap.deprecated || []).includes(market.marketId)
    )
  }

  if (props.activeCategory === MarketCategoryType.DeFi) {
    return (marketCategoriesMap.defi || []).includes(market.marketId)
  }

  if (props.activeCategory === MarketCategoryType.AI) {
    return (marketCategoriesMap.ai || []).includes(market.marketId)
  }

  if (props.activeCategory === MarketCategoryType.Meme) {
    return (marketCategoriesMap.meme || []).includes(market.marketId)
  }
}

function onAscending(value: boolean) {
  isAscending.value = value
}

function onSortBy(value: MarketHeaderType) {
  sortBy.value = value
}
</script>

<template>
  <slot
    v-bind="{
      sortBy,
      onSortBy,
      isAscending,
      onAscending,
      sortedMarkets,
      filteredMarkets
    }"
  />
</template>
