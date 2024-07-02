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
  olpSlugsToIncludeInLowVolume,
  marketTypeOptionsToHideCategory
} from '@/app/data/market'
import {
  MarketQuoteType,
  MarketHeaderType,
  MarketTypeOption,
  MarketCategoryType,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const appStore = useAppStore()

const props = defineProps({
  isAscending: Boolean,
  isLowVolumeMarketsVisible: Boolean,

  activeCategory: {
    type: String as PropType<MarketCategoryType>,
    required: true
  },

  activeQuote: {
    type: String as PropType<MarketQuoteType>,
    required: true
  },

  activeType: {
    type: String as PropType<MarketTypeOption>,
    required: true
  },

  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  },

  search: {
    type: String,
    default: ''
  },

  sortBy: {
    type: String as PropType<MarketHeaderType>,
    required: true
  }
})

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
        marketIsPartOfCategory(props.activeCategory, market)
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
      const isOLPMarket = olpSlugsToIncludeInLowVolume.includes(market.slug)
      const isLowVolumeMarket =
        props.isLowVolumeMarketsVisible ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

      return (
        isPartOfCategory &&
        isPartOfType &&
        isPartOfSearch &&
        isQuotePair &&
        (isLowVolumeMarket || isOLPMarket || props.search)
      )
    })
    .filter((market) => marketIsActive(market.market))
)

const sortedMarkets = computed(() => {
  const upcomingMarketsSlugs = upcomingMarkets.map(({ slug }) => slug)
  const deprecatedMarketsSlugs = deprecatedMarkets.map(({ slug }) => slug)

  if (props.sortBy.trim() === '') {
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

      if (props.sortBy === MarketHeaderType.Price) {
        return new BigNumberInBase(m2.summary.price || 0).comparedTo(
          m1.summary.price || 0
        )
      }

      if (props.sortBy === MarketHeaderType.Market) {
        return m2.market.ticker.localeCompare(m1.market.ticker)
      }

      if (props.sortBy === MarketHeaderType.Change) {
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

  return props.isAscending ? markets.reverse() : markets
})
</script>

<template>
  <slot v-bind="{ sortedMarkets, filteredMarkets }" />
</template>
