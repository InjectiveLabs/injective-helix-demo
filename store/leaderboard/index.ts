import {
  PnlLeaderboard,
  VolLeaderboard,
  LeaderboardRow
} from '@injectivelabs/sdk-ts'
import {
  fetchPnlLeaderboard,
  fetchPnlLeaderboardAccount,
  fetchCompetitionLeaderboard,
  fetchCompetitionLeaderboardAccount
} from '@/store/leaderboard/pnlLeaderboard'
import { indexerGrpcArchiverApi } from '@/app/Services'

type LeaderboardStoreState = {
  pnlLeaderboardAccount?: LeaderboardRow
  competitionLeaderboardAccount?: LeaderboardRow
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
  pnlLeaderboardAccount: undefined,
  competitionLeaderboardAccount: undefined,
  historicalBalance: [],
  historicalPnl: [],
  historicalVolume: []
})

export const useLeaderboardStore = defineStore('leaderboard', {
  state: (): LeaderboardStoreState => initialStateFactory(),
  actions: {
    fetchPnlLeaderboard,
    fetchPnlLeaderboardAccount,
    fetchCompetitionLeaderboard,
    fetchCompetitionLeaderboardAccount,

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
    }
  }
})
