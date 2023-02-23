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
  accountAddress
}: {
  callback: AccountPortfolioStreamCallback
  accountAddress: string
}) => {
  const streamFn = portfolioStream.streamAccountPortfolio.bind(portfolioStream)
  const streamFnArgs = {
    accountAddress,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.BankBalance
  })
}

export const streamSubaccountBalances = ({
  callback,
  subaccountId,
  accountAddress,
  type
}: {
  callback: AccountPortfolioStreamCallback
  accountAddress: string
  subaccountId?: string
  type?: string
}) => {
  const streamFn = portfolioStream.streamAccountPortfolio.bind(portfolioStream)
  const streamFnArgs = {
    subaccountId,
    accountAddress,
    type,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SubaccountBalances
  })
}
