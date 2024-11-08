import { GrpcOrderType, GrpcOrderTypeMap } from '@injectivelabs/sdk-ts'
import { TradeExecutionType, OrderSide } from '@injectivelabs/ts-types'
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

export const orderSideToChaseOrderType = (
  orderType: OrderSide
): GrpcOrderType => {
  switch (orderType) {
    case OrderSide.Unspecified:
      return GrpcOrderTypeMap.UNSPECIFIED
    case OrderSide.Buy:
      return GrpcOrderTypeMap.BUY_PO
    case OrderSide.Sell:
      return GrpcOrderTypeMap.SELL_PO
    case OrderSide.StopBuy:
      return GrpcOrderTypeMap.STOP_BUY
    case OrderSide.StopSell:
      return GrpcOrderTypeMap.STOP_SELL
    case OrderSide.TakeBuy:
      return GrpcOrderTypeMap.TAKE_BUY
    case OrderSide.TakeSell:
      return GrpcOrderTypeMap.TAKE_SELL
    case OrderSide.BuyPO:
      return GrpcOrderTypeMap.BUY_PO
    case OrderSide.SellPO:
      return GrpcOrderTypeMap.SELL_PO
    default:
      return GrpcOrderTypeMap.BUY
  }
}
