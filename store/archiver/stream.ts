import { BigNumberInBase } from '@injectivelabs/utils'
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

      const quantity = new BigNumberInBase(averageEntry.quantity)

      if (quantity.isZero()) {
        return
      }

      console.log('OOOOOOOOO> averageEntry', averageEntry)

      switch (operation) {
        case StreamOperation.Update:
          archiverStore.$patch({
            spotAverageEntries: {
              ...archiverStore.spotAverageEntries,
              [averageEntry.marketId]: averageEntry
            }
          })
      }
    }
  })
}
