import { DerivativeOrderSide, SpotOrderSide } from '@injectivelabs/sdk-ui-ts'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'

export function stringToDerivativeOrderSide(
  side: string
): DerivativeOrderSide | undefined {
  switch (side) {
    case 'buy': {
      return DerivativeOrderSide.Buy
    }
    case 'sell': {
      return DerivativeOrderSide.Sell
    }
    default: {
      return undefined
    }
  }
}

export function stringToSpotOrderSide(side: string): SpotOrderSide | undefined {
  switch (side) {
    case 'buy': {
      return SpotOrderSide.Buy
    }
    case 'sell': {
      return SpotOrderSide.Sell
    }
    default: {
      return undefined
    }
  }
}

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

export function stringToTradeDirection(
  side: string | undefined
): TradeDirection | undefined {
  switch (side) {
    case 'buy': {
      return TradeDirection.Buy
    }
    case 'sell':
    case 'taker': {
      return TradeDirection.Sell
    }
    case 'long': {
      return TradeDirection.Long
    }
    case 'short': {
      return TradeDirection.Short
    }
    default: {
      return undefined
    }
  }
}
