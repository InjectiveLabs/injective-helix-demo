import { defineStore } from 'pinia'
import { toBigNumber } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
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
    spotROIByBaseDenom: (state) => (baseDenom: string) => {
      const sharedSpotStore = useSharedSpotStore()
      const sharedTokenStore = useSharedTokenStore()

      const token = sharedTokenStore.tokenByDenomOrSymbol(baseDenom)

      if (!token) {
        return
      }

      const currentPrice = sharedTokenStore.tokenUsdPrice(token)

      if (!currentPrice) {
        return
      }

      const markets = sharedSpotStore.marketsWithToken.filter(
        (market) => market.baseDenom === baseDenom
      )

      let totalQuantity = ZERO_IN_BASE
      let totalCostBasis = ZERO_IN_BASE

      for (const market of markets) {
        const averageEntry = state.spotAverageEntries[market.marketId]

        if (!averageEntry) {
          continue
        }

        const quantity = toBigNumber(averageEntry.quantity || 0)
        const usdValue = toBigNumber(averageEntry.usdValue || 0)

        if (quantity.isZero() || usdValue.isZero()) {
          continue
        }

        totalQuantity = totalQuantity.plus(quantity)
        totalCostBasis = totalCostBasis.plus(usdValue)
      }

      if (totalCostBasis.isZero() || totalQuantity.isZero()) {
        return
      }

      const averageEntryPrice = totalCostBasis.dividedBy(totalQuantity)
      const currentValue = totalQuantity.multipliedBy(currentPrice)

      const absolutePnl = currentValue.minus(totalCostBasis)
      const roiPercentage = absolutePnl
        .dividedBy(totalCostBasis)
        .multipliedBy(100)

      return {
        absolutePnl,
        roiPercentage,
        averageEntryPrice
      }
    }
  },
  actions: {
    streamSpotAverageEntries,
    cancelSpotAverageEntriesStream,

    setSpotAverageEntry(averageEntry: SpotAverageEntry) {
      this.spotAverageEntries[averageEntry.marketId] = averageEntry
    },

    deleteSpotAverageEntry(marketId: string) {
      delete this.spotAverageEntries[marketId]
    },

    reset() {
      cancelSpotAverageEntriesStream()

      this.$reset()
    }
  }
})
