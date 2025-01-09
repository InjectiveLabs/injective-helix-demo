import { defineStore } from 'pinia'
import { abacusGrpcApi } from '@/app/Services'
import { AccountPoints, HistoricalPoints } from '@/types'

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
