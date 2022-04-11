import { ServiceOptions } from '@injectivelabs/ui-common'
import {
  ExchangeTransformer as BaseExchangeTransformer,
  ExchangeConsumer
} from '@injectivelabs/chain-consumer'
import { BaseService } from '@injectivelabs/ui-common/dist/services/BaseService'

export class ExchangeService extends BaseService {
  protected consumer: ExchangeConsumer

  constructor(options: ServiceOptions) {
    super(options)
    this.consumer = new ExchangeConsumer(this.endpoints.sentryGrpcApi)
  }

  async fetchParams() {
    return BaseExchangeTransformer.grpcParamsToParams(
      await this.consumer.fetchParams()
    )
  }

  async fetchFeeDiscountSchedule() {
    const feeDiscountSchedule = await this.consumer.fetchFeeDiscountSchedule()

    if (!feeDiscountSchedule) {
      return
    }

    return BaseExchangeTransformer.grpcFeeDiscountScheduleToFeeDiscountSchedule(
      feeDiscountSchedule
    )
  }

  async fetchFeeDiscountAccountInfo(injectiveAddress: string) {
    const feeDiscountAccountInfo = await this.consumer.fetchFeeDiscountAccountInfo(
      injectiveAddress
    )

    if (!feeDiscountAccountInfo) {
      return
    }

    return BaseExchangeTransformer.grpcFeeDiscountAccountInfoToFeeDiscountAccountInfo(
      feeDiscountAccountInfo
    )
  }

  async fetchTradingRewardsCampaign() {
    const tradingRewardsCampaign = await this.consumer.fetchTradingRewardsCampaign()

    if (!tradingRewardsCampaign) {
      return
    }

    return BaseExchangeTransformer.grpcTradingRewardsCampaignToTradingRewardsCampaign(
      tradingRewardsCampaign
    )
  }

  async fetchTradeRewardPoints(injectiveAddress: string[]) {
    return await this.consumer.fetchTradeRewardPoints(injectiveAddress)
  }

  async fetchPendingTradeRewardPoints(
    injectiveAddress: string[],
    timestamp: number
  ) {
    return await this.consumer.fetchPendingTradeRewardPoints(
      injectiveAddress,
      timestamp
    )
  }
}
