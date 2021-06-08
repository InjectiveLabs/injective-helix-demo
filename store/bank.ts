import { actionTree, getterTree } from 'typed-vuex'
import { fetchBalances } from '~/app/services/bank'
import { BankBalances } from '~/types'

const initialStateFactory = () => ({
  balances: {} as BankBalances
})

const initialState = initialStateFactory()

export const state = () => ({
  balances: initialState.balances
})

export type BankStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setBalances(state: BankStoreState, balances: BankBalances) {
    state.balances = balances
  },

  reset(state: BankStoreState) {
    const initialState = initialStateFactory()

    state.balances = initialState.balances
  }
}

export const actions = actionTree(
  { state },
  {
    async init(_) {
      await this.app.$accessor.bank.fetchBalances()
    },

    async fetchBalances({ commit }) {
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      commit('setBalances', await fetchBalances(injectiveAddress))
    }
  }
)
