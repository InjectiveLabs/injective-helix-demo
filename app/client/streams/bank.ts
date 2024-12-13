import {
  AccountPortfolioStreamCallback,
  IndexerGrpcAccountPortfolioStream
} from '@injectivelabs/sdk-ts'
import { streamProvider } from '../../providers/StreamProvider'
import { ENDPOINTS } from '@/app/utils/constants'
import { StreamType } from '@/types/enums'

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
  onResetCallback?: Function
  accountAddress: string
  callback: AccountPortfolioStreamCallback
}) => {
  const streamFn = portfolioStream.streamAccountPortfolio.bind(portfolioStream)
  const streamFnArgs = {
    accountAddress,
    callback,
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
    subaccountId,
    accountAddress,
    type,
    callback,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SubaccountBalances
  })
}
