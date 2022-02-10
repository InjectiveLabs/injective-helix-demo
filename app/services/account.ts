import {
  SubaccountTransformer,
  SubaccountStreamType,
  BalanceStreamCallback as SubaccountBalanceStreamCallback
} from '@injectivelabs/subaccount-consumer'
import { SubaccountService as BaseSubaccountService } from '@injectivelabs/ui-common'
import { subaccountStream } from '../singletons/SubaccountStream'
import { streamProvider } from '../providers/StreamProvider'
import { AccountPortfolio } from '~/types/subaccount'
import { AccountMetrics } from '~/types/metrics'

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

export const streamSubaccountBalances = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: SubaccountBalanceStreamCallback
}) => {
  const streamFn = subaccountStream.balances.start.bind(
    subaccountStream.balances
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SubaccountStreamType.Balances
  })
}

export const cancelSubaccountStreams = () => {
  streamProvider.cancel(SubaccountStreamType.Balances)
}
