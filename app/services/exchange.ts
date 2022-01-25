import { ExchangeTransformer } from '@injectivelabs/chain-consumer'
import { exchangeConsumer } from '~/app/singletons/ExchangeConsumer'
import {
  feeDiscountScheduleToUiFeeDiscountSchedule,
  tradeRewardCampaignToUiTradeRewardCampaign
} from '~/app/transformers/exchange'

export const fetchParams = async () => {
  return ExchangeTransformer.grpcParamsToParams(
    await exchangeConsumer.fetchParams()
  )
}

export const fetchFeeDiscountSchedule = async () => {
  const feeDiscountSchedule = await exchangeConsumer.fetchFeeDiscountSchedule()

  if (!feeDiscountSchedule) {
    return
  }

  return feeDiscountScheduleToUiFeeDiscountSchedule(
    ExchangeTransformer.grpcFeeDiscountScheduleToFeeDiscountSchedule(
      feeDiscountSchedule
    )
  )
}

export const fetchFeeDiscountAccountInfo = async (injectiveAddress: string) => {
  const feeDiscountAccountInfo = await exchangeConsumer.fetchFeeDiscountAccountInfo(
    injectiveAddress
  )

  if (!feeDiscountAccountInfo) {
    return
  }

  return ExchangeTransformer.grpcFeeDiscountAccountInfoToFeeDiscountAccountInfo(
    feeDiscountAccountInfo
  )
}

export const fetchTradingRewardsCampaign = async () => {
  const tradingRewardsCampaign = await exchangeConsumer.fetchTradingRewardsCampaign()

  if (!tradingRewardsCampaign) {
    return
  }

  return tradeRewardCampaignToUiTradeRewardCampaign(
    ExchangeTransformer.grpcTradingRewardsCampaignToTradingRewardsCampaign(
      tradingRewardsCampaign
    )
  )
}

export const fetchTradeRewardPoints = async (injectiveAddress: string[]) => {
  return await exchangeConsumer.fetchTradeRewardPoints(injectiveAddress)
}

export const fetchPendingTradeRewardPoints = async (
  injectiveAddress: string[],
  timestamp: number
) => {
  return await exchangeConsumer.fetchPendingTradeRewardPoints(
    injectiveAddress,
    timestamp
  )
}
