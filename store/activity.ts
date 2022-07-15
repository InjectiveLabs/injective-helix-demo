import { actionTree, getterTree } from 'typed-vuex'
import { FundingPayment, TradingReward } from '@injectivelabs/sdk-ts'
import { BankBalanceWithTokenAndBalance } from '@injectivelabs/sdk-ui-ts'
import { exchangeAccountApi, exchangeDerivativesApi, bankApi, tokenService } from '~/app/Services'
import { ActivityFetchOptions } from '~/types'

const initialStateFactory = () => ({
  subaccountFundingPayments: [] as Array<FundingPayment>,
  tradingRewardsHistory: [] as Array<TradingReward>,
  subaccountFundingPaymentsEndTime: 0 as number,
  subaccountFundingPaymentsTotal: 0 as number,
  supportedTokens: [] as Array<BankBalanceWithTokenAndBalance>
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountFundingPayments:
    initialState.subaccountFundingPayments as Array<FundingPayment>,
  tradingRewardsHistory:
    initialState.tradingRewardsHistory as Array<TradingReward>,
  subaccountFundingPaymentsEndTime: initialState.subaccountFundingPaymentsEndTime,
  subaccountFundingPaymentsTotal: initialState.subaccountFundingPaymentsTotal,
  supportedTokens: initialState.supportedTokens as Array<BankBalanceWithTokenAndBalance>
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

  setSubaccountFundingPaymentsEndTime(state: ActivityStoreState, endTime: number) {
    state.subaccountFundingPaymentsEndTime = endTime
  },

  setSubaccountFundingPaymentsTotal(state: ActivityStoreState, total: number) {
    state.subaccountFundingPaymentsTotal = total
  },

  setSupportedTokens(state: ActivityStoreState, supportedTokens: Array<BankBalanceWithTokenAndBalance>) {
    state.supportedTokens = supportedTokens
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

    async fetchSubaccountFundingPayments({ state, commit }, activityFetchOptions: ActivityFetchOptions | undefined) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      if (state.subaccountFundingPayments.length > 0 && state.subaccountFundingPaymentsEndTime === 0) {
        commit('setSubaccountFundingPaymentsEndTime', state.subaccountFundingPayments[0].timestamp)
      }

      const pagination = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters

      const { fundingPayments, paging } = await exchangeDerivativesApi.fetchFundingPayments({
        marketId: filters?.marketId,
        marketIds: filters?.marketIds,
        subaccountId: subaccount.subaccountId,
        pagination: {
          skip: pagination ? pagination.skip : 0,
          limit: pagination ? pagination.limit : 0,
          endTime: state.subaccountFundingPaymentsEndTime
        }
      })

      commit('setSubaccountFundingPaymentsTotal', paging.total)

      commit('setSubaccountFundingPayments', fundingPayments)
    },

    async fetchSupportedTokens({ commit }) {
      const { supply } = await bankApi.fetchTotalSupply()

      const tokens = await Promise.all(supply.map(({ denom }) =>
        tokenService.getDenomToken(denom)
      ))

      const result = tokens.map(token => {
        return {
          balance: '',
          denom: token.denom,
          token
        } as BankBalanceWithTokenAndBalance
      })

      commit('setSupportedTokens', result)
    }
  }
)
