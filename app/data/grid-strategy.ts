import { SpotGridMessages } from '@/types'

export const gridStrategyAuthorizationMessageTypes = [
  SpotGridMessages.MsgWithdraw,
  SpotGridMessages.MsgBatchUpdateOrders,
  SpotGridMessages.MsgCreateSpotMarketOrder
]

export const MARKETS_WITH_LOW_TRADING_SIZE = ['andr-usdt']
