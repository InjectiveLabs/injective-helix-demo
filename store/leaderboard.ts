import { indexerGrpcArchiverApi } from '@/app/Services'

type LeaderboardStoreState = {
  historicalBalance: {
    time: number
    value: number
  }[]

  historicalPnl: {
    time: number
    value: number
  }[]

  historicalVolume: {
    time: number
    value: number
  }[]
}

enum LeaderboardResolution {
  Day = '1D',
  Week = '1W',
  Month = '1M'
}

const initialStateFactory = (): LeaderboardStoreState => ({
  historicalBalance: [],
  historicalPnl: [],
  historicalVolume: []
})

export const useLeaderboardStore = defineStore('leaderboard', {
  state: (): LeaderboardStoreState => initialStateFactory(),
  actions: {
    async fetchHistoricalBalance() {
      const walletStore = useWalletStore()
      const leaderboardStore = useLeaderboardStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalBalance({
        account: walletStore.injectiveAddress,
        resolution: LeaderboardResolution.Month
      })

      const historicalBalance = t.map((time, index) => {
        return {
          time,
          value: v[index]
        }
      })

      leaderboardStore.$patch({
        historicalBalance
      })
    },

    async fetchHistoricalPnl() {
      const walletStore = useWalletStore()
      const leaderboardStore = useLeaderboardStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalRpnl({
        account: walletStore.injectiveAddress,
        resolution: LeaderboardResolution.Month
      })

      const historicalPnl = t.map((time, index) => {
        return {
          time,
          value: v[index]
        }
      })

      leaderboardStore.$patch({
        historicalPnl
      })
    },

    async fetchHistoricalVolume() {
      const walletStore = useWalletStore()
      const leaderboardStore = useLeaderboardStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalVolumes({
        account: walletStore.injectiveAddress,
        resolution: LeaderboardResolution.Month
      })

      const historicalVolume = t.map((time, index) => {
        return {
          time,
          value: v[index]
        }
      })

      leaderboardStore.$patch({
        historicalVolume
      })
    }
  }
})
