import { indexerGrpcArchiverApi } from '@/app/Services'
import {
  fetchPnlLeaderboard,
  fetchCompetitionLeaderboard
} from '@/store/leaderboard/pnlLeaderboard'
import { LeaderboardDuration, HistoricalPortfolioDuration } from '@/types'
import type { PnlLeaderboard, VolLeaderboard } from '@injectivelabs/sdk-ts'

type LeaderboardStoreState = {
  pnlLeaderboard?: PnlLeaderboard
  competitionLeaderboard?: PnlLeaderboard | VolLeaderboard
  historicalPnl: {
    time: number
    value: number
  }[]

  historicalVolume: {
    time: number
    value: number
  }[]

  historicalBalance: {
    time: number
    value: number
  }[]
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
    fetchPnlLeaderboard,
    fetchCompetitionLeaderboard,

    async fetchHistoricalBalance(
      resolution: HistoricalPortfolioDuration = HistoricalPortfolioDuration.OneWeek
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
      resolution: HistoricalPortfolioDuration = HistoricalPortfolioDuration.OneWeek
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
      resolution: LeaderboardDuration = LeaderboardDuration.OneWeek
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
    }
  }
})
