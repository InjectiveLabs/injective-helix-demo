import { TradeExecutionType } from '@injectivelabs/ts-types'
import { TradeTypes } from '~/types'

export function tradeTypesToTradeExecutionTypes(
  type: TradeTypes | undefined
): TradeExecutionType[] | undefined {
  if (type === TradeTypes.Market) {
    return [TradeExecutionType.Market]
  }

  if (type === TradeTypes.Limit) {
    return [
      TradeExecutionType.LimitFill,
      TradeExecutionType.LimitMatchRestingOrder,
      TradeExecutionType.LimitMatchNewOrder
    ]
  }

  return undefined
}

export function orderTypeToOrderTypes(orderType: string) {
  if (orderType === 'take_profit') {
    return ['take_buy', 'take_sell']
  }

  return ['stop_buy', 'stop_sell']
}
