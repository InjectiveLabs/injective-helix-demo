<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketType, SharedMarketStatus } from '@shared/types'
import { deprecatedMarkets } from '@/app/data/market'
import { LOW_VOLUME_MARKET_THRESHOLD } from '@/app/utils/constants'
import { MarketHeaderType, MarketCategoryType } from '@/types'
import type {
  UiMarketWithToken,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

const appStore = useAppStore()
const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    search?: string
    activeCategory?: MarketCategoryType
    isLowVolumeMarketsVisible?: boolean
    markets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {
    search: '',
    activeCategory: MarketCategoryType.All
  }
)

const isAscending = ref(false)
const sortBy = ref(MarketHeaderType.Volume)

const filteredMarkets = computed(() => {
  const formattedSearch = props.search.trim().toLowerCase()

  const activeMarkets = props.markets.filter(
    (market) => market.market.marketStatus === SharedMarketStatus.Active
  )

  if (!formattedSearch) {
    return activeMarkets.filter(({ market, volumeInUsd }) => {
      const isPartOfCategory = verifyMarketIsPartOfType(market)
      const isLowVolumeMarket =
        props.isLowVolumeMarketsVisible ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

      return isPartOfCategory && isLowVolumeMarket
    })
  }

  const searchWithStartWith = activeMarkets.filter(({ market }) => {
    const isDeprecatedMarket = (
      jsonStore.helixMarketCategoriesMap.deprecated || []
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
  })

  if (searchWithStartWith.length) {
    return searchWithStartWith
  }

  return activeMarkets.filter(({ market }) => {
    const isDeprecatedMarket = (
      jsonStore.helixMarketCategoriesMap.deprecated || []
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
      .some((value) => value.includes(formattedSearch))
  })
})

const sortedMarkets = computed(() => {
  const deprecatedMarketsSlugs = deprecatedMarkets.map(({ slug }) => slug)

  if (sortBy.value.trim() === '') {
    return filteredMarkets.value
  }

  const markets = [...filteredMarkets.value].sort(
    (
      m1: UiMarketAndSummaryWithVolumeInUsd,
      m2: UiMarketAndSummaryWithVolumeInUsd
    ) => {
      if (deprecatedMarketsSlugs.includes(m1.market.slug)) {
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

      if (m2.volumeInUsd.toFixed() !== m1.volumeInUsd.toFixed()) {
        return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
      }

      if (m1.market.isVerified && !m2.market.isVerified) {
        return -1
      }

      if (!m1.market.isVerified && m2.market.isVerified) {
        return 1
      }

      return 0
    }
  )

  return isAscending.value ? markets.reverse() : markets
})

function onAscending(value: boolean) {
  isAscending.value = value
}

function onSortBy(value: MarketHeaderType) {
  sortBy.value = value
}

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
    return (jsonStore.helixMarketCategoriesMap.trending || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.Injective) {
    return (jsonStore.helixMarketCategoriesMap.injective || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.Layer1) {
    return (jsonStore.helixMarketCategoriesMap.layer1 || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.Layer2) {
    return (jsonStore.helixMarketCategoriesMap.layer2 || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.DeFi) {
    return (jsonStore.helixMarketCategoriesMap.defi || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.AI) {
    return (jsonStore.helixMarketCategoriesMap.ai || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.Meme) {
    return (jsonStore.helixMarketCategoriesMap.meme || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.RWA) {
    return (jsonStore.helixMarketCategoriesMap.rwa || []).includes(
      market.marketId
    )
  }

  if (props.activeCategory === MarketCategoryType.iAssets) {
    return (jsonStore.helixMarketCategoriesMap.iAssets || []).includes(
      market.marketId
    )
  }
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
