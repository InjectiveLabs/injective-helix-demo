import { EpochMeta, MarketConfig } from '@injectivelabs/exchange-consumer'
import {
  UiEpoch,
  UiEpochMeta,
  UiEpochMarkets,
  UiDmmMarketMaker,
  UiEpochDate
} from '~/types'

export const EpochMetaToUiDmmMarketMaker = (
  epochMeta: EpochMeta
): UiDmmMarketMaker[] => {
  return Object.entries(epochMeta.dmmAddressesList).map(
    ([name, addresses]: [string, string[]]) => {
      return {
        name,
        address: addresses[0]
      }
    }
  )
}

export const EpochMetaToUIMeta = (epochMeta: EpochMeta): UiEpochMeta => {
  return {
    id: epochMeta.id,
    startTime: epochMeta.startTime,
    endTime: epochMeta.endTime,
    rewardInjNum: epochMeta.rewardInjNum,
    lcsRewardFraction: epochMeta.lcsRewardFraction,
    vcsRewardFraction: epochMeta.vcsRewardFraction
  }
}

export const EpochMetaToUiMarkets = (
  epochMeta: EpochMeta
): UiEpochMarkets[] => {
  return Object.entries(epochMeta.marketsMap).map(
    ([marketId, marketConfig]: [string, MarketConfig]) => {
      return {
        marketId,
        ...marketConfig
      }
    }
  )
}

export const EpochMetaToUiEpochMeta = (epochMeta: EpochMeta): UiEpoch => {
  return {
    marketMakers: EpochMetaToUiDmmMarketMaker(epochMeta),
    markets: EpochMetaToUiMarkets(epochMeta),
    meta: EpochMetaToUIMeta(epochMeta)
  }
}

export const EpochMetaToUiEpochDate = (epochMeta: EpochMeta): UiEpochDate => {
  return {
    id: epochMeta.id,
    startTime: epochMeta.startTime,
    endTime: epochMeta.endTime,
    rewardInjNum: epochMeta.rewardInjNum
  }
}
