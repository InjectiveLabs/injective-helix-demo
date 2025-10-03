import { toBigNumber } from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/ts-types'
import {
  streamSpotAverageEntries as grpcStreamSpotAverageEntries,
  cancelSpotAverageEntriesStream as grpcCancelSpotAverageEntriesStream
} from '@/app/client/streams/archiver'

export const cancelSpotAverageEntriesStream = grpcCancelSpotAverageEntriesStream

export const streamSpotAverageEntries = ({
  account,
  onResetCallback
}: {
  account: string
  onResetCallback?: Function
}) => {
  const archiverStore = useArchiverStore()

  grpcStreamSpotAverageEntries({
    account,
    onResetCallback,
    callback: ({ averageEntry, operation }) => {
      if (!averageEntry) {
        return
      }

      switch (operation) {
        case StreamOperation.Update: {
          const quantity = toBigNumber(averageEntry.quantity)

          if (quantity.isZero()) {
            archiverStore.deleteSpotAverageEntry(averageEntry.marketId)
            return
          }

          archiverStore.setSpotAverageEntry(averageEntry)
          break
        }
      }
    }
  })
}
