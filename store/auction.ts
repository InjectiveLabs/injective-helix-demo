import { actionTree } from 'typed-vuex'
import { AuctionModuleState } from '@injectivelabs/chain-consumer'
import { auctionService } from '~/app/Services'

const initialState = {
  auctionModuleState: undefined
}

export const state = () => ({
  auctionModuleState: initialState.auctionModuleState as
    | AuctionModuleState
    | undefined
})

export type AuctionStoreState = ReturnType<typeof state>

export const mutations = {
  setAuctionModuleState(
    state: AuctionStoreState,
    auctionModuleState: AuctionModuleState
  ) {
    state.auctionModuleState = auctionModuleState
  }
}

export const actions = actionTree(
  { state },
  {
    async fetchAuctionModuleState({ commit }) {
      const auctionModuleState = await auctionService.fetchAuctionModuleState()

      commit('setAuctionModuleState', auctionModuleState)
    }
  }
)
