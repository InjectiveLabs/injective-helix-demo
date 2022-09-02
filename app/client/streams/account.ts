import {
<<<<<<< HEAD
  IndexerGrpcAccountStream,
  BalanceStreamCallback
=======
  BalanceStreamCallback,
  IndexerGrpcAccountStream
>>>>>>> helix/master
} from '@injectivelabs/sdk-ts'
import { streamProvider } from '../../providers/StreamProvider'
import { ENDPOINTS } from '~/app/utils/constants'
import { StreamType } from '~/types/enums'

export const subaccountStream = new IndexerGrpcAccountStream(
<<<<<<< HEAD
  ENDPOINTS.exchangeApi
=======
  ENDPOINTS.indexerApi
>>>>>>> helix/master
)

export const streamSubaccountBalances = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: BalanceStreamCallback
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
