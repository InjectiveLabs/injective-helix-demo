import { GrpcOrderTypeMap } from '@injectivelabs/sdk-ts'
import { OrderSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { OrderTypeFilter, ConditionalOrderSide } from '@/types'
import type { GrpcOrderType } from '@injectivelabs/sdk-ts'

export function derivativeTypeToExecutionTypes(type: OrderTypeFilter) {
  switch (type) {
    case OrderTypeFilter.TakeProfitMarket:
    case OrderTypeFilter.StopLossMarket:
    case OrderTypeFilter.Market:
      return [OrderTypeFilter.Market] as any
    case OrderTypeFilter.TakeProfitLimit:
    case OrderTypeFilter.StopLossLimit:
    case OrderTypeFilter.Limit:
      return [OrderTypeFilter.Limit] as any
    default:
      return undefined
  }
}

export function derivativeTypeToOrderType(type: OrderTypeFilter) {
  switch (type) {
    case OrderTypeFilter.TakeProfitMarket:
    case OrderTypeFilter.TakeProfitLimit:
      return [ConditionalOrderSide.TakeBuy, ConditionalOrderSide.TakeSell]

    case OrderTypeFilter.StopLossMarket:
    case OrderTypeFilter.StopLossLimit:
      return [ConditionalOrderSide.StopBuy, ConditionalOrderSide.StopSell]

    default:
      return undefined
  }
}

export function derivativeTypeToTradeType(type: OrderTypeFilter) {
  switch (type) {
    case OrderTypeFilter.TakeProfitMarket:
    case OrderTypeFilter.StopLossMarket:
    case OrderTypeFilter.Market:
      return [TradeExecutionType.Market]
    case OrderTypeFilter.TakeProfitLimit:
    case OrderTypeFilter.StopLossLimit:
    case OrderTypeFilter.Limit:
      return [
        TradeExecutionType.LimitFill,
        TradeExecutionType.LimitMatchNewOrder,
        TradeExecutionType.LimitMatchRestingOrder
      ]

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
    case OrderSide.StopSell:
      return GrpcOrderTypeMap.STOP_SELL
    case OrderSide.TakeSell:
      return GrpcOrderTypeMap.TAKE_SELL
    case OrderSide.StopBuy:
      return GrpcOrderTypeMap.STOP_BUY
    case OrderSide.TakeBuy:
      return GrpcOrderTypeMap.TAKE_BUY
    case OrderSide.SellPO:
      return GrpcOrderTypeMap.SELL_PO
    case OrderSide.BuyPO:
      return GrpcOrderTypeMap.BUY_PO
    case OrderSide.Sell:
      return GrpcOrderTypeMap.SELL_PO
    case OrderSide.Buy:
      return GrpcOrderTypeMap.BUY_PO
    default:
      return GrpcOrderTypeMap.BUY
  }
}
