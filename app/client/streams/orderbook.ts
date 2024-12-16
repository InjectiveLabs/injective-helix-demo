import { spotMarketStream } from '@/app/client/streams/spot'
import { streamProvider } from '@/app/providers/StreamProvider'
import { derivativesMarketStream } from '@/app/client/streams/derivatives'
import { StreamType } from '@/types'

export const cancelSpotOrderbookUpdate = () => {
  streamProvider.cancel(StreamType.SpotOrderbookUpdate)
}

export const cancelDerivativeOrderbookUpdate = () => {
  streamProvider.cancel(StreamType.DerivativesOrderbookUpdate)
}

export const streamSpotOrderbookUpdate = ({
  marketId,
  callback,
  onResetCallback
}: {
  marketId: string
  callback: (data: any) => void
  onResetCallback?: () => void
}) => {
  const streamFn =
    spotMarketStream.streamSpotOrderbookUpdate.bind(spotMarketStream)
  const streamFnArgs = {
    marketIds: [marketId],
    callback,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotOrderbookUpdate
  })
}

export const streamDerivativeOrderbookUpdate = ({
  marketId,
  callback,
  onResetCallback
}: {
  marketId: string
  callback: (data: any) => void
  onResetCallback?: () => void
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrderbookUpdate.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    marketIds: [marketId],
    callback,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesOrderbookUpdate
  })
}
