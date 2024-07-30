import { PnlLeaderboard, VolLeaderboard } from '@injectivelabs/sdk-ts'
import {
  fetchLeaderboardByDuration,
  fetchLeaderboardByResolution
} from '@/store/leaderboard/utils'
import { indexerGrpcArchiverApi } from '@/app/Services'
import { LeaderboardType } from '@/types'

type LeaderboardStoreState = {
  leaderboard?: PnlLeaderboard | VolLeaderboard
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
  leaderboard: undefined,
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

    async fetchLeaderboard({
      type,
      duration,
      resolution
    }: {
      type: LeaderboardType
      resolution?: string
      duration?: {
        startDate: number
        endDate: number
      }
    }) {
      const leaderboardStore = useLeaderboardStore()

      if (resolution) {
        leaderboardStore.$patch({
          leaderboard: await fetchLeaderboardByResolution(type, resolution)
        })

        return
      }

      if (!duration) {
        return
      }

      leaderboardStore.$patch({
        leaderboard: await fetchLeaderboardByDuration(type, duration)
      })
    }
  }
})
