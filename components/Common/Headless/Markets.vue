<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
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
  marketTypeOptionsToHideCategory,
  olpMarketIdsToIncludeInLowVolume
} from '@/app/data/market'
import {
  TradeSubPage,
  MarketQuoteType,
  MarketHeaderType,
  MarketTypeOption,
  MarketCategoryType,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    search?: string
    markets: UiMarketAndSummaryWithVolumeInUsd[]
    activeType: MarketTypeOption
    activeQuote: MarketQuoteType
    activeCategory: MarketCategoryType
    isLowVolumeMarketsVisible?: boolean
  }>(),
  {
    search: '',
    markets: () => [],
    activeType: MarketTypeOption.All,
    activeQuote: MarketQuoteType.All,
    activeCategory: MarketCategoryType.All,
    isLowVolumeMarketsVisible: false
  }
)

const isAscending = ref(false)
const sortBy = ref(MarketHeaderType.Volume)

const userMarkets = computed(() => {
  const openPositionMarketIds = positionStore.positions.map(
    ({ marketId }) => marketId
  )
  const openSpotOrdersMarketIds = spotStore.subaccountOrders.map(
    ({ marketId }) => marketId
  )
  const openDerivativeOrdersMarketIds = derivativeStore.subaccountOrders.map(
    ({ marketId }) => marketId
  )

  const spotBaseTokenDenomToMarketIdMap = spotStore.markets.reduce(
    (denomToMarketIdMap, market) => {
      denomToMarketIdMap[market.baseToken.denom] = market.marketId

      return denomToMarketIdMap
    },
    {} as Record<string, string>
  )

  const userBalanceSpotMarketIds = accountStore.bankBalances.reduce(
    (marketIds, { amount, denom }) =>
      new BigNumberInBase(amount).gt(0) &&
      spotBaseTokenDenomToMarketIdMap[denom]
        ? [...marketIds, spotBaseTokenDenomToMarketIdMap[denom]]
        : marketIds,
    [] as string[]
  )

  return [
    ...new Set([
      ...openPositionMarketIds,
      ...openSpotOrdersMarketIds,
      ...userBalanceSpotMarketIds,
      ...openDerivativeOrdersMarketIds
    ])
  ]
})

const filteredMarkets = computed(() =>
  props.markets
    .filter(({ market, volumeInUsd }) => {
      const shouldIgnoreCategory = marketTypeOptionsToHideCategory.includes(
        props.activeType
      )
      const isPartOfCategory =
        shouldIgnoreCategory ||
        marketIsPartOfCategory(props.activeCategory, market, !!props.search)
      const isPartOfSearch = marketIsPartOfSearch(props.search, market)
      const isPartOfType = marketIsPartOfType({
        market,
        userMarkets:
          props.activeType === MarketTypeOption.Favorites
            ? appStore.favoriteMarkets
            : userMarkets.value,
        activeType: props.activeType
      })
      const isQuotePair = marketIsQuotePair(props.activeQuote, market)
      const isOLPMarket = olpMarketIdsToIncludeInLowVolume.includes(
        market.marketId
      )
      const isLowVolumeMarket =
        props.isLowVolumeMarketsVisible ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD) ||
        props.activeType === MarketTypeOption.Permissionless

      return (
        isQuotePair &&
        isPartOfType &&
        isPartOfSearch &&
        isPartOfCategory &&
        (isLowVolumeMarket || isOLPMarket || props.search)
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

function onAscending(value: boolean) {
  isAscending.value = value
}

function onSortBy(value: MarketHeaderType) {
  sortBy.value = value
}

function fetchSpotPageData() {
  Promise.all([
    positionStore.fetchPositions(),
    derivativeStore.fetchSubaccountOrders()
  ]).catch($onError)
}

function fetchFuturesPageData() {
  Promise.all([spotStore.fetchSubaccountOrders()]).catch($onError)
}

function fetchMarketsPageData() {
  Promise.all([
    positionStore.fetchPositions(),
    spotStore.fetchSubaccountOrders(),
    derivativeStore.fetchSubaccountOrders()
  ]).catch($onError)
}

function fetchUserOrdersAndPositions() {
  if ((route?.name as string).includes(TradeSubPage.Spot)) {
    fetchSpotPageData()

    return
  }

  if ((route?.name as string).includes(TradeSubPage.Futures)) {
    fetchFuturesPageData()

    return
  }

  fetchMarketsPageData()
}

onSubaccountChange(fetchUserOrdersAndPositions)
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
