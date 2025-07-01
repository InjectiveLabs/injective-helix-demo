import { indexerGrpcTradingStream } from '@/app/Services'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types'
import type { GridStrategyStreamResponse } from '@injectivelabs/sdk-ts'
export const streamGridStrategies = ({
  callback,
  marketId,
  accountAddresses,
  onResetCallback
}: {
  marketId?: string
  accountAddresses?: string[]
  onResetCallback?: () => void
  callback: (data: GridStrategyStreamResponse) => void
}) => {
  const streamFn = indexerGrpcTradingStream.streamGridStrategies.bind(
    indexerGrpcTradingStream
  )
  const streamFnArgs = {
    callback,
    marketId,
    accountAddresses,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.GridStrategies
  })
}

export const cancelGridStrategiesStream = () => {
  streamProvider.cancel(StreamType.GridStrategies)
}
