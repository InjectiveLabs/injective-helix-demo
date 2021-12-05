import { MarketConfig } from '@injectivelabs/exchange-consumer'
import { MarketType, Token } from '~/types'

export interface UiEpochMarkets extends MarketConfig {
  marketId: string
}

export interface UiEpochMarketsWithTokenMeta extends UiEpochMarkets {
  ticker: string
  token: Token
  type: MarketType
  subType: MarketType
}

export interface UiDmmMarketMaker {
  name: string
  address: string
}

export interface UiEpochMeta {
  id: string
  startTime: string
  endTime: string
  rewardInjNum: string
  lcsRewardFraction: string
  vcsRewardFraction: string
}

export interface UiEpochDate {
  id: string
  rewardInjNum: string
  startTime: string
  endTime: string
}

export interface UiEpoch {
  marketMakers: UiDmmMarketMaker[]
  markets: UiEpochMarkets[]
  meta: UiEpochMeta
}

export interface UiEpochSummaryItem {
  name: string
  address: string
  total: string
  totalPercentage: string
  rewardInInj: string
  rewardInUsd: string
}

export interface UIEpochMarketELCSItem {
  name: string
  address: string
  buy: string
  sell: string
  elcs: string
}

export interface UIEpochMarketEVCSItem {
  name: string
  address: string
  volume: string
  evcs: string
}

export interface UIEpochRecordItem {
  number: number,
  elcs: string,
  evcs: string,
  createdAt: string
}
