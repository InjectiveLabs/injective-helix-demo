import { actionTree, getterTree } from 'typed-vuex'
import { UiDerivativeTrade, UiSpotTrade } from '@injectivelabs/sdk-ui-ts'
import { UserDeposit } from '@injectivelabs/sdk-ts'
import { redeem } from '~/app/services/gasRebate'
import { backupPromiseCall } from '~/app/utils/async'
import {
  apolloConsumer,
  exchangeDerivativesApi,
  exchangeSpotApi
} from '~/app/Services'

const initialStateFactory = () => ({
  trades: [] as Array<UiSpotTrade | UiDerivativeTrade>,
  deposits: [] as Array<UserDeposit>
})

const initialState = initialStateFactory()

export const state = () => ({
  trades: initialState.trades as Array<UiSpotTrade | UiDerivativeTrade>,
  deposits: initialState.deposits as UserDeposit[]
})

export type GasRebateStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setTrades(
    state: GasRebateStoreState,
    trades: Array<UiSpotTrade | UiDerivativeTrade>
  ) {
    state.trades = trades
  },

  setDeposits(state: GasRebateStoreState, deposits: Array<UserDeposit>) {
    state.deposits = deposits
  },

  reset(state: GasRebateStoreState) {
    state.trades = []
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    reset({ commit }) {
      commit('reset')
    },

    async init(_) {
      await this.app.$accessor.gasRebate.fetchTrades()
      await this.app.$accessor.gasRebate.fetchDeposits()
      await this.app.$accessor.account.fetchSubaccountsBalances()
    },

    async fetchTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const { trades: spotTrades } = await exchangeSpotApi.fetchTrades({
        subaccountId: subaccount.subaccountId
      })
      const { trades: derivativeTrades } = await exchangeDerivativesApi.fetchTrades({
        subaccountId: subaccount.subaccountId
      })

      commit('setTrades', [...spotTrades, ...derivativeTrades])
    },

    async fetchDeposits({ commit }) {
      const { address, isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !address) {
        return
      }

      commit('setDeposits', await apolloConsumer.fetchUserDeposits(address))
    },

    async redeem(_) {
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      await redeem({
        address,
        injectiveAddress
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
