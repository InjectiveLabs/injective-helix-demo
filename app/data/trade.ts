import { MsgType } from '@injectivelabs/ts-types'

export const helixTopHeaderHeight = 56

export const TRADING_MESSAGES = [
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgBatchUpdateOrders,
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgBatchCreateSpotLimitOrders,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgBatchCancelDerivativeOrders,
  MsgType.MsgBatchCreateDerivativeLimitOrders
]
