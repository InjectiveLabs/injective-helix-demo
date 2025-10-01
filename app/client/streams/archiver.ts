import { IndexerGrpcArchiverStream } from '@injectivelabs/sdk-ts'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types'
import type { SpotAverageEntriesStreamCallback } from '@injectivelabs/sdk-ts'

// TODO: change to mainnet when ready
export const archiverStream = new IndexerGrpcArchiverStream(
  'https://k8s.mainnet.staging.archiver.grpc-web.injective.network'
)

export const cancelSpotAverageEntriesStream = () => {
  streamProvider.cancel(StreamType.SpotAverageEntries)
}

export const streamSpotAverageEntries = ({
  account,
  callback,
  onResetCallback
}: {
  account: string
  onResetCallback?: Function
  callback: SpotAverageEntriesStreamCallback
}) => {
  const streamFn = archiverStream.streamSpotAverageEntries.bind(archiverStream)
  const streamFnArgs = {
    account,
    callback,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotAverageEntries
  })
}
