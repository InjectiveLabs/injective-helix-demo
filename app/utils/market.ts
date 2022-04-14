import {
  UiDerivativeMarketWithToken,
  MarketType,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { MarketRoute } from '~/types'

export const getMarketRoute = (
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
): MarketRoute | undefined => {
  if (market.type === MarketType.Derivative) {
    return {
      name: 'derivatives-derivative',
      params: {
        marketId: market.marketId,
        derivative: market.slug
      }
    }
  }

  if (market.type === MarketType.Spot) {
    return {
      name: 'spot-spot',
      params: {
        marketId: market.marketId,
        spot: market.slug
      }
    }
  }
}
