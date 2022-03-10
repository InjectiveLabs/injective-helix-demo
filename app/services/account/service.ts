import {
  SubaccountTransformer,
  AccountPortfolio
} from '@injectivelabs/subaccount-consumer'
import {
  SubaccountService as BaseSubaccountService,
  AccountMetrics
} from '@injectivelabs/ui-common'

export class SubaccountService extends BaseSubaccountService {
  async fetchAccountPortfolio(
    injectiveAddress: string
  ): Promise<AccountPortfolio> {
    const promise = this.consumer.fetchPortfolioValue(injectiveAddress)
    const accountPortfolio = await this.fetchOrFetchAndMeasure(
      promise,
      AccountMetrics.FetchPortfolioValue
    )

    if (!accountPortfolio) {
      throw new Error(
        `The account with ${injectiveAddress} address is not found`
      )
    }

    return SubaccountTransformer.grpcAccountPortfolioToAccountPortfolio(
      accountPortfolio
    )
  }

  async fetchTradingRewardHistory(injectiveAddress: string) {
    const promise = this.consumer.fetchRewards(injectiveAddress)
    const rewards = await this.fetchOrFetchAndMeasure(
      promise,
      AccountMetrics.FetchPortfolioValue
    )

    return SubaccountTransformer.grpcTradingRewardsToTradingRewards(rewards)
  }
}
