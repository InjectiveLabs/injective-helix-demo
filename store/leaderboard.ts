import { defineStore } from 'pinia'
import { ChronosLeaderboardEntry } from '@injectivelabs/sdk-ts'
import { indexerRestLeaderboardChronosApi } from '@/app/Services'

type LeaderboardStoreState = {
  entries: ChronosLeaderboardEntry[]
  lastUpdatedAt: number
}

const initialStateFactory = (): LeaderboardStoreState => ({
  entries: [],
  lastUpdatedAt: 0
})

export const useLeaderboardStore = defineStore('leaderboard', {
  state: (): LeaderboardStoreState => initialStateFactory(),
  actions: {
    async init() {
      const leaderboardStore = useLeaderboardStore()

      await leaderboardStore.fetchLeaderboard('1d')
    },

    async fetchLeaderboard(resolution: string) {
      const leaderboardStore = useLeaderboardStore()

      const { updatedAt, entries } =
        await indexerRestLeaderboardChronosApi.fetchLeaderboard(resolution)

      leaderboardStore.$patch({
        entries: entries || [],
        lastUpdatedAt: updatedAt
      })
    }
  }
})
