import { BITCOIN_GECKO_ID, MarketType } from '@injectivelabs/ui-common'
import { UiEpochMarketsWithToken } from './types'

export const findActiveMarket = (
  markets: UiEpochMarketsWithToken[]
): string => {
  const btcMarkets = markets.filter(({ token }: UiEpochMarketsWithToken) => {
    return token?.coinGeckoId === BITCOIN_GECKO_ID
  })

  // set default market to BTC PERP || BTC Spot
  const defaultMarket =
    btcMarkets.length > 0
      ? btcMarkets.find(({ subType }) => subType === MarketType.Perpetual) ||
        btcMarkets[0]
      : undefined

  return defaultMarket?.marketId || markets[0].marketId
}
