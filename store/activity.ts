import { actionTree, getterTree } from 'typed-vuex'
import { FundingPayment } from '@injectivelabs/derivatives-consumer'
import { TradingReward } from '@injectivelabs/subaccount-consumer'
import { derivativeService, subaccountService } from '~/app/Services'

const initialStateFactory = () => ({
  subaccountFundingPayments: [] as Array<FundingPayment>,
  tradingRewardsHistory: [] as Array<TradingReward>
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountFundingPayments: initialState.subaccountFundingPayments as Array<FundingPayment>,
  tradingRewardsHistory: initialState.tradingRewardsHistory as Array<TradingReward>
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
      const {
        isUserWalletConnected,
        injectiveAddress
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !injectiveAddress) {
        return
      }

      commit(
        'setTradingRewardHistory',
        await subaccountService.fetchTradingRewardHistory(injectiveAddress)
      )
    },

    async fetchSubaccountFundingPayments({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const fundingPayments = await derivativeService.fetchFundingPayments({
        subaccountId: subaccount.subaccountId
      })

      commit('setSubaccountFundingPayments', fundingPayments)
    }
  }
)
