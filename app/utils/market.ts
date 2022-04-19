import {
  UiDerivativeMarketWithToken,
  MarketType,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'
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

export const getAbbreviatedVolume = (value: BigNumberInBase): string => {
  const thousand = 1000
  const million = 1000000
  const billion = 1000000000

  if (value.gt(billion)) {
    return `${value.dividedBy(billion).toFormat(2)}B`
  }

  if (value.gt(million)) {
    return `${value.dividedBy(million).toFormat(2)}M`
  }

  if (value.gt(thousand)) {
    return `${value.dividedBy(million).toFormat(2)}K`
  }

  return value.toFormat(2)
}
