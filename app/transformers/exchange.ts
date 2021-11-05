import { getTokenMetaData } from '../services/tokens'
import { tokenMetaToToken } from './token'
import {
  TradingRewardCampaignInfo,
  BaseFeeDiscountSchedule,
  BaseTradingRewardCampaignInfo,
  FeeDiscountSchedule
} from '~/types/exchange'
import { Token } from '~/types'

export const feeDiscountScheduleToUiFeeDiscountSchedule = (
  feeDiscountSchedule: BaseFeeDiscountSchedule
): FeeDiscountSchedule => {
  return {
    ...feeDiscountSchedule,
    quoteTokenMeta: feeDiscountSchedule.quoteDenomsList
      .map((denom) => tokenMetaToToken(getTokenMetaData(denom), denom))
      .filter((token) => token) as Token[]
  }
}

export const tradingRewardCampaignInfoToUiTradingRewardCampaignInfo = (
  tradingRewardCampaignInfo: BaseTradingRewardCampaignInfo
): TradingRewardCampaignInfo => {
  return {
    ...tradingRewardCampaignInfo,
    quoteSymbolsList: (tradingRewardCampaignInfo.quoteDenomsList
      .map((denom) => tokenMetaToToken(getTokenMetaData(denom), denom))
      .filter((token) => token) as Token[]).map((token) => token.symbol)
  }
}
