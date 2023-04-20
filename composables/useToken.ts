import type { Token } from '@injectivelabs/token-metadata'

export function useToken() {
  const tokenStore = useTokenStore()

  const fetchTokenUsdPrice = (token: Token[]) => {
    const coinGeckoIdList = token
      .map((token) => token.coinGeckoId)
      .filter((id) => id)

    return tokenStore.fetchTokensUsdPriceMap(coinGeckoIdList)
  }

  return {
    fetchTokenUsdPrice
  }
}
