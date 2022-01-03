import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, mutationTree, getterTree } from 'typed-vuex'
import { fetchValidator, delegate } from '~/app/services/staking'
import { backupPromiseCall } from '~/app/utils/async'
import { UiValidator } from '~/types/validators'

export const initialStateFactory = () => ({
  validator: undefined as UiValidator | undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  validator: initialState.validator as UiValidator | undefined
})

export type StakingStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = mutationTree(state, {
  setValidator(state: StakingStoreState, validator: UiValidator) {
    state.validator = validator
  },

  reset(state: StakingStoreState) {
    const initialState = initialStateFactory()

    state.validator = initialState.validator
  }
})

export const actions = actionTree(
  { state, mutations },
  {
    async fetchValidator({ commit }, validatorAddress: string) {
      commit('setValidator', await fetchValidator(validatorAddress))
    },

    async delegateToValidator(
      _,
      {
        amount,
        validatorAddress
      }: {
        validatorAddress: string
        amount: BigNumberInBase
      }
    ) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.app.validate()
      await this.app.$accessor.wallet.validate()

      await delegate({
        address,
        injectiveAddress,
        validatorAddress,
        amount: amount.toWei().toFixed()
      })

      backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    },

    async reset({ commit }) {
      await Promise.resolve(commit('reset'))
    }
  }
)
