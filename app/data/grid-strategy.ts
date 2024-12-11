import { SpotGridMessages, VolatilityStrategyType } from '@/types'

export const gridStrategyAuthorizationMessageTypes = [
  SpotGridMessages.MsgWithdraw,
  SpotGridMessages.MsgBatchUpdateOrders,
  SpotGridMessages.MsgCreateSpotMarketOrder
]

export const MARKETS_WITH_LOW_TRADING_SIZE = ['andr-usdt']

export const volatilityStrategyBounds = {
  [VolatilityStrategyType.Aggressive]: {
    priceBounds: '0.005',
    trailingBounds: '0.05'
  },
  [VolatilityStrategyType.Moderate]: {
    priceBounds: '0.02',
    trailingBounds: '0.1'
  },
  [VolatilityStrategyType.Passive]: {
    priceBounds: '0.05',
    trailingBounds: '0.2'
  }
}

export function calculateOrderLevels(
  amountInvested: number,
  maxOrderNumber: number
): number {
  if (amountInvested <= 50) {
    return 10
  } else {
    const levels = Math.min(
      10 + Math.floor((amountInvested - 50) / 5),
      maxOrderNumber
    )
    return levels
  }
}

export function calculateGridLevels(
  lower: number,
  upper: number,
  grids: number
): number[] {
  const step = (upper - lower) / grids
  return Array.from({ length: grids + 1 }, (_, i) => lower + step * i)
}
