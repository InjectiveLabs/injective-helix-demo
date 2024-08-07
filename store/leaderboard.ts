import { PnlLeaderboard, VolLeaderboard } from '@injectivelabs/sdk-ts'
import { indexerGrpcArchiverApi } from '@/app/Services'
import { LeaderboardType } from '@/types'

type LeaderboardStoreState = {
  pnlLeaderboard?: PnlLeaderboard
  competitionLeaderboard?: PnlLeaderboard | VolLeaderboard
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
  pnlLeaderboard: undefined,
  competitionLeaderboard: undefined,
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
      const leaderboardStore = useLeaderboardStore()
      const sharedWalletStore = useSharedWalletStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalBalance({
        account: sharedWalletStore.injectiveAddress,
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
      const leaderboardStore = useLeaderboardStore()
      const sharedWalletStore = useSharedWalletStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalRpnl({
        account: sharedWalletStore.injectiveAddress,
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
      const leaderboardStore = useLeaderboardStore()
      const sharedWalletStore = useSharedWalletStore()

      const { t, v } = await indexerGrpcArchiverApi.fetchHistoricalVolumes({
        account: sharedWalletStore.injectiveAddress,
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
    },

    async fetchPnlLeaderboard(resolution: string) {
      const leaderboardStore = useLeaderboardStore()

      leaderboardStore.$patch({
        pnlLeaderboard:
          await indexerGrpcArchiverApi.fetchPnlLeaderboardFixedResolution({
            resolution
          })
      })
    },
    async fetchCompetitionLeaderboard({
      type,
      duration
    }: {
      type: LeaderboardType
      duration: {
        startDate: string
        endDate: string
      }
    }) {
      const leaderboardStore = useLeaderboardStore()

      if (type === LeaderboardType.Pnl) {
        leaderboardStore.$patch({
          competitionLeaderboard:
            await indexerGrpcArchiverApi.fetchPnlLeaderboard({
              endDate: duration.endDate,
              startDate: duration.startDate
            })
        })

        return
      }

      leaderboardStore.$patch({
        competitionLeaderboard:
          await indexerGrpcArchiverApi.fetchVolLeaderboard({
            endDate: duration.endDate,
            startDate: duration.startDate
          })
      })
    }
  }
})
