import { actionTree, mutationTree } from 'typed-vuex'
import { fetchNinjaPassCodes } from '~/app/services/ninjapass'

const initialStateFactory = () => ({
  codes: [] as { address: string; code: string }[]
})

const initialState = initialStateFactory()

export const state = () => ({
  codes: initialState.codes as { address: string; code: string }[]
})

export type NinjaPassStoreState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  setCodes(
    state: NinjaPassStoreState,
    codes: { address: string; code: string }[]
  ) {
    state.codes = codes
  }
})

export const actions = actionTree(
  { state, mutations },
  {
    async init(_) {},

    async fetchCodes({ commit }) {
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const codes = (await fetchNinjaPassCodes(injectiveAddress)) || []

      commit('setCodes', codes)
    }
  }
)
