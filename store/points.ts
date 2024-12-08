import { defineStore } from 'pinia'
import { abacusGrpcApi } from '@/app/Services'
import { AccountPoints, HistoricalPoints } from '@/types'

const DAILY_LIMIT = 180
const WEEKLY_LIMIT = 80

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
    async fetchPoints() {
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
          sharedWalletStore.injectiveAddress
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
          sharedWalletStore.injectiveAddress,
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
          sharedWalletStore.injectiveAddress,
          WEEKLY_LIMIT
        )
      })
    },

    reset() {
      const pointsStore = usePointsStore()

      pointsStore.$reset()
    }
  }
})
