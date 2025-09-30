import { defineStore } from 'pinia'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  streamSpotAverageEntries,
  cancelSpotAverageEntriesStream
} from '@/store/archiver/stream'
import type { SpotAverageEntry } from '@injectivelabs/sdk-ts'

type ArchiverStoreState = {
  spotAverageEntries: Record<string, SpotAverageEntry>
}

const initialStateFactory = (): ArchiverStoreState => ({
  spotAverageEntries: {}
})

export const useArchiverStore = defineStore('archiver', {
  state: (): ArchiverStoreState => initialStateFactory(),
  getters: {
    spotAverageEntries: (state) => state.spotAverageEntries,
    spotROIByMarketId: (state) => (marketId: string) => {
      const spotStore = useSpotStore()

      const market = spotStore.marketByIdOrSlug(marketId)
      const averageEntry = state.spotAverageEntries[marketId]

      if (!market || !averageEntry) {
        return
      }

      const { lastTradedPriceInUsd: markPriceInUsd } = useSpotLastPrice(
        computed(() => market)
      )

      if (!markPriceInUsd.value || !averageEntry.averageEntryPrice) {
        return
      }

      const entryPrice = new BigNumberInBase(averageEntry.averageEntryPrice)
      const currentPrice = markPriceInUsd.value

      if (entryPrice.isZero()) {
        return
      }

      const roi = currentPrice
        .minus(entryPrice)
        .dividedBy(entryPrice)
        .multipliedBy(100)

      return roi
    }
  },
  actions: {
    streamSpotAverageEntries,
    cancelSpotAverageEntriesStream,

    reset() {
      const archiverStore = useArchiverStore()

      const { spotAverageEntries } = initialStateFactory()

      archiverStore.$patch({ spotAverageEntries })
    }
  }
})
