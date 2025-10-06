import { type AllChronosMarketHistory } from '@injectivelabs/sdk-ts'
import { type SharedUiMarketHistory } from '../../types'

export const toUiMarketHistory = (
  marketsHistory: AllChronosMarketHistory
): SharedUiMarketHistory => ({
  marketId: marketsHistory.marketID,
  resolution: marketsHistory.resolution,
  time: marketsHistory.t,
  volume: marketsHistory.v,
  closePrice: marketsHistory.c,
  highPrice: marketsHistory.h,
  lowPrice: marketsHistory.l,
  openPrice: marketsHistory.o
})
