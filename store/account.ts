import { AccountAddress } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'nuxt-typed-vuex'
import {
  fetchSubaccounts,
  fetchSubaccount,
  deposit
} from '~/app/services/account'
import { backupPromiseCall } from '~/app/utils/async'
import { UiSubaccount } from '~/types/subaccount'

const initialStateFactory = () => ({
  subaccountIds: [] as string[],
  subaccount: undefined as UiSubaccount | undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountIds: initialState.subaccountIds as string[],
  subaccount: initialState.subaccount as UiSubaccount | undefined
})

export type AccountStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setSubacccountIds(state: AccountStoreState, subaccountIds: string[]) {
    state.subaccountIds = subaccountIds
  },

  setSubaccount(state: AccountStoreState, subaccount: UiSubaccount) {
    state.subaccount = subaccount
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async init({ dispatch }) {
      await dispatch('fetchSubaccounts')
    },

    async fetchSubaccounts({ commit }, injectiveAddress?: AccountAddress) {
      const {
        injectiveAddress: connectedInjectiveAddress
      } = this.app.$accessor.wallet

      const injAddress = injectiveAddress || connectedInjectiveAddress

      const subaccountIds = await fetchSubaccounts(injAddress)

      if (subaccountIds.length === 0) {
        return
      }

      const [subaccountId] = subaccountIds

      commit('setSubacccountIds', subaccountIds)
      commit('setSubaccount', await fetchSubaccount(subaccountId))
    },

    async updateSubaccount({ commit, state }) {
      const { subaccount } = state

      if (!subaccount) {
        return
      }

      const { subaccountId } = subaccount

      commit('setSubaccount', await fetchSubaccount(subaccountId))
    },

    async deposit(
      { state, dispatch },
      { amount, denom }: { amount: BigNumberInBase; denom: string }
    ) {
      const { subaccount } = state
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (
        !address ||
        !isUserWalletConnected ||
        !subaccount ||
        !injectiveAddress
      ) {
        return
      }

      await deposit({
        address,
        denom,
        injectiveAddress,
        subaccountId: subaccount.subaccountId,
        amount: amount.toWei()
      })

      await backupPromiseCall(() => dispatch('updateSubaccount'))
      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
