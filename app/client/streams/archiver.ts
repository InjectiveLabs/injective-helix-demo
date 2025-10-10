import { IndexerGrpcArchiverStream } from '@injectivelabs/sdk-ts'
import { HELIX_ENDPOINTS } from '@/app/utils/constants'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types'
import type { SpotAverageEntriesStreamCallback } from '@injectivelabs/sdk-ts'

export const archiverStream = new IndexerGrpcArchiverStream(
  HELIX_ENDPOINTS.archiver
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
