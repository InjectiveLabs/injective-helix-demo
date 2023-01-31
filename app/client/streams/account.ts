import {
  BalanceStreamCallback,
  IndexerGrpcAccountStream
} from '@injectivelabs/sdk-ts'
import { ENDPOINTS } from '@/app/utils/constants'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types/enums'

export const subaccountStream = new IndexerGrpcAccountStream(ENDPOINTS.indexer)

export const streamSubaccountBalances = ({
  callback,
  subaccountId
}: {
  callback: BalanceStreamCallback
  subaccountId: string
}) => {
  const streamFn =
    subaccountStream.streamSubaccountBalance.bind(subaccountStream)
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SubaccountBalances
  })
}

export const cancelSubaccountStreams = () => {
  streamProvider.cancel(StreamType.SubaccountBalances)
}
