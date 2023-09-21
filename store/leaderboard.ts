import { defineStore } from 'pinia'
import { UiLeaderboardEntry } from '@injectivelabs/sdk-ui-ts'
import { indexerRestLeaderboardChronosApi } from '@/app/Services'

type LeaderboardStoreState = {
  entries: UiLeaderboardEntry[]
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
