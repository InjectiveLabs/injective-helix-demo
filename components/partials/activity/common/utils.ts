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
