import { MsgType } from '@injectivelabs/ts-types'

export const TRADING_MESSAGES = [
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgBatchUpdateOrders,
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgBatchCancelDerivativeOrders
]
