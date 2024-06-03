export enum MarketStatus {
  Unspecified = 'unspecified',
  Active = 'active',
  Paused = 'paused',
  Demolished = 'demolished',
  Expired = 'expired'
}

export interface AggregatedPriceLevel {
  p: string
  q: string
}

export interface UiAggregatedPriceLevel {
  price: string
  quantity: string
  oldQuantity?: string
  total: string
  depth: number
}

export interface SymbolWithMarketId {
  symbol: string
  marketId: string
  coingeckoId: string
  isUsdtQuote: boolean
  quoteMarket: string
}

export type IntervalOption = {
  label: string
  value: {
    countback: number
    resolution: number
  }
}
