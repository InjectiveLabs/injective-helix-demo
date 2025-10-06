import type { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import type {
  Orderbook,
  SpotTrade,
  DerivativeTrade
} from '@injectivelabs/sdk-ts'

export interface SharedUiSpotTrade extends SpotTrade {
  ticker?: string
}

export interface SharedUiDerivativeTrade extends DerivativeTrade {
  ticker?: string
}

export interface SharedUiOrderbookWithSequence extends Orderbook {
  sequence: number
}

export interface SharedUiOrderbookSummary {
  total: BigNumberInBase
  quantity: BigNumberInBase
}

export interface SharedUiPriceLevel {
  price: string
  timestamp: number
  aggregatePrices?: string[]
  quantity: string | BigNumberInWei
}

export interface SharedUiOrderbookPriceLevel {
  price: string
  depth: number
  timestamp: number
  oldQuantity?: string
  total: BigNumberInBase
  quantity: BigNumberInWei
  aggregatedPrice?: string
  aggregatePrices?: string[]
}
