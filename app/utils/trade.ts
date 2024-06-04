import { MsgType, TradeExecutionType } from '@injectivelabs/ts-types'
import { ConditionalOrderSide, OrderTypeFilter } from '@/types'

export function derivativeTypeToExecutionTypes(type: OrderTypeFilter) {
  switch (type) {
    case OrderTypeFilter.Limit:
    case OrderTypeFilter.StopLossLimit:
    case OrderTypeFilter.TakeProfitLimit:
      return [OrderTypeFilter.Limit] as any
    case OrderTypeFilter.Market:
    case OrderTypeFilter.StopLossMarket:
    case OrderTypeFilter.TakeProfitMarket:
      return [OrderTypeFilter.Market] as any
    default:
      return undefined
  }
}

export function derivativeTypeToOrderType(type: OrderTypeFilter) {
  switch (type) {
    case OrderTypeFilter.StopLossLimit:
    case OrderTypeFilter.StopLossMarket:
      return [ConditionalOrderSide.StopBuy, ConditionalOrderSide.StopSell]

    case OrderTypeFilter.TakeProfitLimit:
    case OrderTypeFilter.TakeProfitMarket:
      return [ConditionalOrderSide.TakeBuy, ConditionalOrderSide.TakeSell]

    default:
      return [ConditionalOrderSide.Buy, ConditionalOrderSide.Sell]
  }
}

export function derivativeTypeToTradeType(type: OrderTypeFilter) {
  switch (type) {
    case OrderTypeFilter.Limit:
    case OrderTypeFilter.StopLossLimit:
    case OrderTypeFilter.TakeProfitLimit:
      return [
        TradeExecutionType.LimitFill,
        TradeExecutionType.LimitMatchNewOrder,
        TradeExecutionType.LimitMatchRestingOrder
      ]
    case OrderTypeFilter.Market:
    case OrderTypeFilter.StopLossMarket:
    case OrderTypeFilter.TakeProfitMarket:
      return [TradeExecutionType.Market]

    default:
      return undefined
  }
}

export const TRADING_MESSAGES = [
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgBatchCancelDerivativeOrders
]
