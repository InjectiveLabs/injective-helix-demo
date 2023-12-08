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
