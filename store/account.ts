import { AccountAddress } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'nuxt-typed-vuex'
import {
  fetchSubaccounts,
  fetchSubaccount,
  deposit
} from '~/app/services/account'
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
    },

    async deposit(
      { state },
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

      // await testnetBackupPromiseCall(() => this.getTokenBalances())
    }
  }
)
