import { TokenStatic } from '@injectivelabs/token-metadata'

const POLL_USD_PRICE_INTERVAL = 30 * 1000

const coinGeckoIdList = ref<string[]>([])

export function useTokenUsdPrice() {
  const tokenStore = useTokenStore()

  const { pause, resume } = useIntervalFn(
    () => fetchTokensUsdPriceMap,
    POLL_USD_PRICE_INTERVAL
  )

  function addTokensToPriceWatchList(tokens = [] as TokenStatic[]) {
    const coinGeckoIds = tokens
      .map((token) => token && token.coinGeckoId)
      .filter((coinGeckoId) => coinGeckoId && coinGeckoId.toLowerCase())

    coinGeckoIdList.value = [
      ...new Set([...coinGeckoIds, ...coinGeckoIdList.value])
    ]

    pause()

    if (!allCoinGeckoIdOrDenomOnPriceWatchList([...coinGeckoIds])) {
      fetchTokensUsdPriceMap()
    }

    resume()
  }

  function allCoinGeckoIdOrDenomOnPriceWatchList(
    coinGeckoIdOrDenoms = [] as string[]
  ) {
    return coinGeckoIdOrDenoms.every((coinGeckoIdOrDenom) => {
      if (!coinGeckoIdOrDenom) {
        return true
      }

      return Object.keys(tokenStore.tokenUsdPriceMap).includes(
        coinGeckoIdOrDenom.toLowerCase()
      )
    })
  }

  function allCoinGeckoIdsOnPriceMap(coinGeckoIds = [] as string[]) {
    if (coinGeckoIds.length === 0) {
      return Object.keys(tokenStore.tokenUsdPriceMap).length > 0
    }

    return coinGeckoIds
      .filter((coinGeckoId) => coinGeckoId)
      .every((coinGeckoId) => {
        if (!coinGeckoId) {
          return true
        }

        return Object.keys(tokenStore.tokenUsdPriceMap).includes(
          coinGeckoId.toLowerCase()
        )
      })
  }

  function fetchTokensUsdPriceMap() {
    tokenStore.fetchTokensUsdPriceMap(coinGeckoIdList.value)
  }

  return {
    fetchTokensUsdPriceMap,
    allCoinGeckoIdsOnPriceMap,
    addTokensToPriceWatchList
  }
}
