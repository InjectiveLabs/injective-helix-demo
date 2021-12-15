import { actionTree } from 'typed-vuex'
import { AuctionModuleState } from '@injectivelabs/chain-consumer'
import { fetchAuctionModuleState } from '~/app/services/auction'

// hard code auction round to optimize performance by skipping fetchAuction api call if auctionsViewed contains auctionRound
export const hardcodedAuctionRound = 23
export const hardcodedEndTime = 1639573200 * 1000

const initialState = {
  auctionModuleState: undefined,
  auctionsViewed: []
}

export const state = () => ({
  auctionModuleState: initialState.auctionModuleState as
    | AuctionModuleState
    | undefined,
  auctionsViewed: initialState.auctionsViewed as number[]
})

export type AuctionStoreState = ReturnType<typeof state>

export const mutations = {
  setAuctionModuleState(
    state: AuctionStoreState,
    auctionModuleState: AuctionModuleState
  ) {
    state.auctionModuleState = auctionModuleState
  },

  setAuctionsViewed(state: AuctionStoreState, auctionRound: number) {
    state.auctionsViewed = [...state.auctionsViewed, auctionRound]
  }
}

export const actions = actionTree(
  { state },
  {
    async fetchAuctionModuleState({ commit }) {
      const auctionModuleState = await fetchAuctionModuleState()

      commit('setAuctionModuleState', auctionModuleState)
    }
  }
)
