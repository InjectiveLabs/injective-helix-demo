import { MsgType } from '@injectivelabs/ts-types'
export const TRADING_MESSAGES = [
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgLiquidatePosition,
  MsgType.MsgBatchUpdateOrders,
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgIncreasePositionMargin,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgBatchCreateSpotLimitOrders,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgBatchCancelDerivativeOrders,
  MsgType.MsgBatchCreateDerivativeLimitOrders
]
