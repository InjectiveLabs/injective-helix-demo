import { actionTree, getterTree } from 'typed-vuex'
import { FundingPayment, TradingReward } from '@injectivelabs/sdk-ts'
import { exchangeAccountApi, exchangeDerivativesApi } from '~/app/Services'

const initialStateFactory = () => ({
  subaccountFundingPayments: [] as Array<FundingPayment>,
  tradingRewardsHistory: [] as Array<TradingReward>
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountFundingPayments:
    initialState.subaccountFundingPayments as Array<FundingPayment>,
  tradingRewardsHistory:
    initialState.tradingRewardsHistory as Array<TradingReward>
})

export type ActivityStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setSubaccountFundingPayments(
    state: ActivityStoreState,
    subaccountFundingPayments: Array<FundingPayment>
  ) {
    state.subaccountFundingPayments = subaccountFundingPayments
  },

  setTradingRewardHistory(
    state: ActivityStoreState,
    tradingRewardsHistory: Array<TradingReward>
  ) {
    state.tradingRewardsHistory = tradingRewardsHistory
  },

  reset(state: ActivityStoreState) {
    const initialState = initialStateFactory()

    state.tradingRewardsHistory = initialState.tradingRewardsHistory
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async fetchTradingRewardsHistory({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected, injectiveAddress } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !injectiveAddress) {
        return
      }

      commit(
        'setTradingRewardHistory',
        await exchangeAccountApi.fetchRewards({
          address: injectiveAddress,
          epoch: -1
        })
      )
    },

    async fetchSubaccountFundingPayments({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const fundingPayments = await exchangeDerivativesApi.fetchFundingPayments(
        {
          subaccountId: subaccount.subaccountId
        }
      )

      commit('setSubaccountFundingPayments', fundingPayments)
    }
  }
)
