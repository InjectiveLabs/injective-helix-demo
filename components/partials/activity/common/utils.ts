import { TradeExecutionType } from '@injectivelabs/ts-types'

export function stringToTradeExecutionTypes(
  type: string | undefined
): TradeExecutionType[] | undefined {
  switch (type) {
    case 'market': {
      return [TradeExecutionType.Market]
    }
    case 'limit':
    case 'limitFill':
    case 'limitMatchRestingOrder':
    case 'limitMatchNewOrder': {
      return [
        TradeExecutionType.LimitFill,
        TradeExecutionType.LimitMatchRestingOrder,
        TradeExecutionType.LimitMatchNewOrder
      ]
    }
    default: {
      return undefined
    }
  }
}
