import { AccountAddress } from '@injectivelabs/ts-types'
import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { fetchSubaccounts, fetchSubaccount } from '~/app/services/account'
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
    async fetchSubaccounts({ commit }, injectiveAddress: AccountAddress) {
      const subaccountIds = await fetchSubaccounts(injectiveAddress)

      if (subaccountIds.length === 0) {
        throw new Error('There are no subaccounts for this address')
      }

      const [subaccountId] = subaccountIds

      commit('setSubacccountIds', subaccountIds)
      commit('setSubaccount', await fetchSubaccount(subaccountId))
    }
  }
)
