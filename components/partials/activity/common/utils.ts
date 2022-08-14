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

export function stringToTradeExecutionType (type: string): TradeExecutionType | undefined {
  switch (type) {
    case 'market': {
      return TradeExecutionType.Market
    }
    case 'limitFill': {
      return TradeExecutionType.LimitFill
    }
    case 'limitMatchRestingOrder': {
      return TradeExecutionType.LimitMatchRestingOrder
    }
    case 'limitMatchNewOrder': {
      return TradeExecutionType.LimitMatchNewOrder
    }
    default: {
      return undefined
    }
  }
}

export function stringToTradeDirection(side: string): TradeDirection | undefined {
  switch (side) {
    case 'buy': {
      return TradeDirection.Buy
    }
    case 'taker': {
      return TradeDirection.Sell
    }
    default: {
      return undefined
    }
  }
}
