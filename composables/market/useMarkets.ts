import { BigNumberInBase } from '@injectivelabs/utils'

import {
  MarketCategoryType,
  MarketHeaderType,
  MarketQuoteType,
  MarketStatus,
  MarketTypeOption,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'
import {
  marketIsActive,
  marketIsPartOfCategory,
  marketIsPartOfSearch,
  marketIsPartOfType,
  marketIsQuotePair
} from '@/app/utils/market'
import { LOW_VOLUME_MARKET_THRESHOLD } from '@/app/utils/constants'
import {
  deprecatedMarkets,
  olpSlugsToIncludeInLowVolume,
  upcomingMarkets
} from '@/app/data/market'

const activeCategoryOptions = Object.values(MarketCategoryType).map(
  (value) => ({ label: `markets.${value}`, value })
)
const activeQuoteOptions = Object.values(MarketQuoteType).map((value) => ({
  label: `markets.${value}`,
  value
}))
const activeTypeOptions = Object.values(MarketTypeOption).map((value) => ({
  label: `markets.${value}`,
  value
}))

export default function useMarkets() {
  const appStore = useAppStore()
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()
  const derivativeStore = useDerivativeStore()

  const activeCategory = ref(MarketCategoryType.All)
  const activeQuote = ref(MarketQuoteType.All)
  const activeType = ref(MarketTypeOption.All)
  const search = ref('')
  const sortBy = ref(MarketHeaderType.Volume)
  const isAscending = ref(false)
  const isLowVolumeMarketsVisible = ref(true)

  const recentlyExpiredMarkets = computed(() =>
    derivativeStore.markets.filter(
      ({ marketStatus }) =>
        marketStatus === MarketStatus.Expired ||
        marketStatus === MarketStatus.Paused
    )
  )

  const favoriteMarkets = computed(() => appStore.favoriteMarkets)

  const marketsWithSummaryAndVolumeInUsd = computed(() =>
    [
      ...spotStore.marketsWithSummary,
      ...derivativeStore.marketsWithSummary
    ].map(({ market, summary }) => {
      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPrice(market.quoteToken)
      )

      return {
        market,
        summary,
        volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
      }
    })
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
          favoriteMarkets: favoriteMarkets.value,
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

        // if (new BigNumberInBase(m2.volumeInUsd).eq(m1.volumeInUsd)) {
        //   return m1.market.ticker.localeCompare(m2.market.ticker)
        // }

        // default: sort by volume
        return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
        // return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
      }
    )

    return isAscending.value ? markets.reverse() : markets
  })

  return {
    search,
    sortBy,
    activeType,
    activeQuote,
    isAscending,
    sortedMarkets,
    activeCategory,
    favoriteMarkets,
    filteredMarkets,
    activeTypeOptions,
    activeQuoteOptions,
    activeCategoryOptions,
    recentlyExpiredMarkets,
    isLowVolumeMarketsVisible,
    marketsWithSummaryAndVolumeInUsd
  }
}
