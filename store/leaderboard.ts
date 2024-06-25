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
    async fetchHistoricalBalance(
      resolution: LeaderboardResolution = LeaderboardResolution.Week
    ) {
      const walletStore = useSharedWalletStore()
      const leaderboardStore = useLeaderboardStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalBalance({
        account: walletStore.injectiveAddress,
        resolution
      })

      const historicalBalance = t.map((time, index) => {
        return {
          time: time * 1000,
          value: v[index]
        }
      })

      leaderboardStore.$patch({
        historicalBalance: historicalBalance.reverse()
      })
    },

    async fetchHistoricalPnl(
      resolution: LeaderboardResolution = LeaderboardResolution.Week
    ) {
      const walletStore = useSharedWalletStore()
      const leaderboardStore = useLeaderboardStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalRpnl({
        account: walletStore.injectiveAddress,
        resolution
      })

      const historicalPnl = t.map((time, index) => {
        return {
          time: time * 1000,
          value: v[index]
        }
      })

      leaderboardStore.$patch({
        historicalPnl: historicalPnl.reverse()
      })
    },

    async fetchHistoricalVolume(
      resolution: LeaderboardResolution = LeaderboardResolution.Week
    ) {
      const walletStore = useSharedWalletStore()
      const leaderboardStore = useLeaderboardStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalVolumes({
        account: walletStore.injectiveAddress,
        resolution
      })

      const historicalVolume = t.map((time, index) => {
        return {
          time: time * 1000,
          value: v[index]
        }
      })

      leaderboardStore.$patch({
        historicalVolume: historicalVolume.reverse()
      })
    }
  }
})
