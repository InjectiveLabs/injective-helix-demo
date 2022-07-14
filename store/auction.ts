import { actionTree } from 'typed-vuex'
import { AuctionModuleState } from '@injectivelabs/sdk-ts'
import { auctionApi } from '~/app/Services'
import { UiAuctionTransformer } from '~/app/client/transformers/UiAuctionTransformer'

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
      const auctionModuleState = await auctionApi.fetchModuleState()

      commit(
        'setAuctionModuleState',
        UiAuctionTransformer.grpcAuctionModuleStateToModuleState(
          auctionModuleState
        )
      )
    }
  }
)
