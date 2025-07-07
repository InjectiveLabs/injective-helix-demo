import { defineStore } from 'pinia'
import { getAbacusGrpcApi } from '@/app/Services'
import type { AccountPoints, HistoricalPoints } from '@/types'

const DAILY_LIMIT = 365
const WEEKLY_LIMIT = 52

type PointStoreState = {
  accountPoints?: AccountPoints
  pointsHistory: HistoricalPoints[]
}

const initialStateFactory = (): PointStoreState => ({
  pointsHistory: [],
  accountPoints: undefined
})

export const usePointsStore = defineStore('points', {
  state: (): PointStoreState => initialStateFactory(),
  actions: {
    async fetchAccountPointsStat() {
      const abacusGrpcApi = await getAbacusGrpcApi()

      const pointsStore = usePointsStore()
      const sharedWalletStore = useSharedWalletStore()

      if (
        !sharedWalletStore.isUserConnected ||
        !sharedWalletStore.authZOrInjectiveAddress
      ) {
        return
      }

      pointsStore.$patch({
        accountPoints: await abacusGrpcApi.fetchAccountLatestPoints(
          sharedWalletStore.authZOrInjectiveAddress
        )
      })
    },

    async fetchAccountDailyPoints() {
      const abacusGrpcApi = await getAbacusGrpcApi()

      const pointsStore = usePointsStore()
      const sharedWalletStore = useSharedWalletStore()

      if (
        !sharedWalletStore.isUserConnected ||
        !sharedWalletStore.authZOrInjectiveAddress
      ) {
        return
      }

      pointsStore.$patch({
        pointsHistory: await abacusGrpcApi.fetchAccountDailyPoints(
          sharedWalletStore.authZOrInjectiveAddress,
          DAILY_LIMIT
        )
      })
    },

    async fetchAccountWeeklyPoints() {
      const abacusGrpcApi = await getAbacusGrpcApi()

      const pointsStore = usePointsStore()
      const sharedWalletStore = useSharedWalletStore()

      if (
        !sharedWalletStore.isUserConnected ||
        !sharedWalletStore.authZOrInjectiveAddress
      ) {
        return
      }

      pointsStore.$patch({
        pointsHistory: await abacusGrpcApi.fetchAccountWeeklyPoints(
          sharedWalletStore.authZOrInjectiveAddress,
          WEEKLY_LIMIT
        )
      })
    },

    reset() {
      const pointsStore = usePointsStore()

      pointsStore.$patch({
        ...initialStateFactory()
      })
    }
  }
})
