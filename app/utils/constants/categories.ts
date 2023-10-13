import { MarketCategoryType } from '@/types'

export const MARKET_CATEGORIES: {
  // [MarketCategoryType.Commodities]: string[]
  // [MarketCategoryType.Energy]: string[]
  [MarketCategoryType.Index]: string[]
  [MarketCategoryType.Metals]: string[]
} = {
  // [MarketCategoryType.Commodities]: [],
  // [MarketCategoryType.Energy]: [],
  [MarketCategoryType.Index]: ['evindex-usdt-perp', 'trucpi-usdt-perp'],
  [MarketCategoryType.Metals]: ['gold-usdt-perp']
}
