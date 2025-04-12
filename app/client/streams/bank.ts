import { ENDPOINTS } from '@shared/utils/constant'
import { streamProvider } from '../../providers/StreamProvider'
import { IndexerGrpcAccountPortfolioStream } from '@injectivelabs/sdk-ts'
import { StreamType } from '@/types'
import type { AccountPortfolioStreamCallback } from '@injectivelabs/sdk-ts'

export const portfolioStream = new IndexerGrpcAccountPortfolioStream(
  ENDPOINTS.indexer
)

export const cancelBankBalanceStream = () => {
  streamProvider.cancel(StreamType.BankBalance)
}

export const cancelSubaccountBalanceStream = () => {
  streamProvider.cancel(StreamType.SubaccountBalances)
}

export const streamBankBalances = ({
  callback,
  accountAddress,
  onResetCallback
}: {
  accountAddress: string
  onResetCallback?: Function
  callback: AccountPortfolioStreamCallback
}) => {
  const streamFn = portfolioStream.streamAccountPortfolio.bind(portfolioStream)
  const streamFnArgs = {
    callback,
    accountAddress,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.BankBalance
  })
}

export const streamSubaccountBalances = ({
  type,
  callback,
  subaccountId,
  accountAddress,
  onResetCallback
}: {
  type?: string
  subaccountId?: string
  accountAddress: string
  onResetCallback?: Function
  callback: AccountPortfolioStreamCallback
}) => {
  const streamFn = portfolioStream.streamAccountPortfolio.bind(portfolioStream)
  const streamFnArgs = {
    type,
    callback,
    subaccountId,
    accountAddress,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SubaccountBalances
  })
}
