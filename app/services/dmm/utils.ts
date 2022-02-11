import { BITCOIN_GECKO_ID, MarketType } from '@injectivelabs/ui-common'
import { UiEpochMarketsWithTokenMeta } from './types'

export const findActiveMarket = (
  markets: UiEpochMarketsWithTokenMeta[]
): string => {
  const btcMarkets = markets.filter(
    ({ token }: UiEpochMarketsWithTokenMeta) => {
      return token?.coinGeckoId === BITCOIN_GECKO_ID
    }
  )

  // set default market to BTC PERP || BTC Spot
  const defaultMarket =
    btcMarkets.length > 0
      ? btcMarkets.find(({ subType }) => subType === MarketType.Perpetual) ||
        btcMarkets[0]
      : undefined

  return defaultMarket?.marketId || markets[0].marketId
}
