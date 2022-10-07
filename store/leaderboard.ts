import { actionTree, mutationTree } from 'typed-vuex'
import { UiLeaderboardEntry } from '@injectivelabs/sdk-ui-ts'
import { indexerRestLeaderboardChronosApi } from '~/app/Services'

const initialStateFactory = () => ({
  entries: [] as UiLeaderboardEntry[],
  lastUpdatedAt: 0 as number
})

const initialState = initialStateFactory()

export const state = () => ({
  entries: initialState.entries as UiLeaderboardEntry[],
  lastUpdatedAt: initialState.lastUpdatedAt as number
})

export type LeaderboardStoreState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  setEntries(state: LeaderboardStoreState, entries: UiLeaderboardEntry[]) {
    state.entries = entries
  },

  setLastUpdatedAt(state: LeaderboardStoreState, lastUpdatedAt: number) {
    state.lastUpdatedAt = lastUpdatedAt
  }
})

export const actions = actionTree(
  { state, mutations },
  {
    async init(_) {
      await this.app.$accessor.leaderboard.fetchLeaderboard('1d')
    },

    async fetchLeaderboard({ commit }, resolution: string) {
      const { updatedAt, entries } = await indexerRestLeaderboardChronosApi.fetchLeaderboard(
        resolution
      )

      commit('setEntries', entries || [])
      commit('setLastUpdatedAt', updatedAt)
    }
  }
)
