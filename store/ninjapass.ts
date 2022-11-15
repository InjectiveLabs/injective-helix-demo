import { actionTree, mutationTree } from 'typed-vuex'
import ninjaPassApi from '~/app/services/ninja-pass-api'

const initialStateFactory = () => ({
  codes: [] as string[]
})

const initialState = initialStateFactory()

export const state = () => ({
  codes: initialState.codes as string[]
})

export type NinjaPassStoreState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  setCodes(state: NinjaPassStoreState, codes: string[]) {
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

      try {
        const codes = await ninjaPassApi.fetchNinjaPassCodes(injectiveAddress)

        commit('setCodes', codes)
      } catch (ex) {
        // TODO: Maybe add some logging, for now fail silently as it's not blocking.
      }
    }
  }
)
