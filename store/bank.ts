import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { fetchBalances } from '~/app/services/bank'
import { BankBalances } from '~/types'

const initialStateFactory = () => ({
  balances: {} as BankBalances
})

const initialState = initialStateFactory()

export const state = () => ({
  balances: initialState.balances
})

export type TokenStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setBalances(state: TokenStoreState, balances: BankBalances) {
    state.balances = balances
  }
}

export const actions = actionTree(
  { state },
  {
    async init({ dispatch }) {
      await dispatch('fetchBalances')
    },

    async fetchBalances({ commit }) {
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      commit('setBalances', await fetchBalances(injectiveAddress))
    }
  }
)
