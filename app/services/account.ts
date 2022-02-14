import {
  SubaccountTransformer,
  AccountPortfolio
} from '@injectivelabs/subaccount-consumer'
import {
  SubaccountService as BaseSubaccountService,
  AccountMetrics
} from '@injectivelabs/ui-common'

export class SubaccountService extends BaseSubaccountService {
  async fetchAccountPortfolio(injAddress: string): Promise<AccountPortfolio> {
    const promise = this.consumer.fetchPortfolioValue(injAddress)
    const accountPortfolio = await this.fetchOrFetchAndMeasure(
      promise,
      AccountMetrics.FetchPortfolioValue
    )

    if (!accountPortfolio) {
      throw new Error(`The account with ${injAddress} address is not found`)
    }

    return SubaccountTransformer.grpcAccountPortfolioToAccountPortfolio(
      accountPortfolio
    )
  }
}
