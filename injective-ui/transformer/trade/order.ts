import { OrderSide } from '@injectivelabs/ts-types'
import { GrpcOrderTypeMap } from '@injectivelabs/sdk-ts'
import type { GrpcOrderType } from '@injectivelabs/sdk-ts'

export const orderSideToOrderType = (orderType: OrderSide): GrpcOrderType => {
  switch (orderType) {
    case OrderSide.Unrecognized:
      return GrpcOrderTypeMap.UNRECOGNIZED
    case OrderSide.Unspecified:
      return GrpcOrderTypeMap.UNSPECIFIED
    case OrderSide.SellAtomic:
      return GrpcOrderTypeMap.SELL_ATOMIC
    case OrderSide.BuyAtomic:
      return GrpcOrderTypeMap.BUY_ATOMIC
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
      return GrpcOrderTypeMap.SELL
    case OrderSide.Buy:
      return GrpcOrderTypeMap.BUY
    default:
      return GrpcOrderTypeMap.BUY
  }
}
