import { DerivativeOrderSide, SpotOrderSide } from '@injectivelabs/sdk-ui-ts'

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
