import { actionTree, getterTree } from 'typed-vuex'
import {
  fetchFeeDiscountSchedule,
  fetchFeeDiscountAccountInfo,
  fetchTradingRewardsCampaign,
  fetchTradeRewardPoints
} from '~/app/services/exchange'
import {
  FeeDiscountAccountInfo,
  TradingRewardsCampaign,
  FeeDiscountSchedule,
  FeeDiscountTierInfo
} from '~/types/exchange'

const initialStateFactory = () => ({
  feeDiscountSchedule: undefined as FeeDiscountSchedule | undefined,
  feeDiscountAccountInfo: undefined as FeeDiscountAccountInfo | undefined,
  tradingRewardsCampaign: undefined as TradingRewardsCampaign | undefined,
  tradeRewardsPoints: [] as string[]
})

const initialState = initialStateFactory()

export const state = () => ({
  feeDiscountSchedule: initialState.feeDiscountSchedule as
    | FeeDiscountSchedule
    | undefined,
  feeDiscountAccountInfo: initialState.feeDiscountAccountInfo as
    | FeeDiscountAccountInfo
    | undefined,
  tradingRewardsCampaign: initialState.tradingRewardsCampaign as
    | TradingRewardsCampaign
    | undefined,
  tradeRewardsPoints: initialState.tradeRewardsPoints as string[]
})

export type ExchangeStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setFeeDiscountSchedule(
    state: ExchangeStoreState,
    feeDiscountSchedule: FeeDiscountSchedule
  ) {
    state.feeDiscountSchedule = feeDiscountSchedule
  },

  setTradingRewardsCampaign(
    state: ExchangeStoreState,
    tradingRewardsCampaign: TradingRewardsCampaign
  ) {
    state.tradingRewardsCampaign = tradingRewardsCampaign
  },

  setFeeDiscountAccountInfo(
    state: ExchangeStoreState,
    feeDiscountAccountInfo: FeeDiscountAccountInfo
  ) {
    state.feeDiscountAccountInfo = feeDiscountAccountInfo
  },

  setTradeRewardPoints(
    state: ExchangeStoreState,
    tradeRewardsPoints: string[]
  ) {
    state.tradeRewardsPoints = tradeRewardsPoints
  },

  reset(state: ExchangeStoreState) {
    const initialState = initialStateFactory()

    state.feeDiscountSchedule = initialState.feeDiscountSchedule
    state.feeDiscountAccountInfo = initialState.feeDiscountAccountInfo
    state.tradingRewardsCampaign = initialState.tradingRewardsCampaign
    state.tradeRewardsPoints = initialState.tradeRewardsPoints
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async initFees(_) {
      await this.app.$accessor.exchange.fetchFeeDiscountSchedule()
      await this.app.$accessor.exchange.fetchFeeDiscountAccountInfo()
    },

    async initRewards(_) {
      await this.app.$accessor.exchange.fetchTradingRewardsCampaign()
      await this.app.$accessor.exchange.fetchTradeRewardPoints()
    },

    async fetchFeeDiscountSchedule({ commit }) {
      commit('setFeeDiscountSchedule', await fetchFeeDiscountSchedule())
    },

    async fetchFeeDiscountAccountInfo({ commit }) {
      const {
        isUserWalletConnected,
        injectiveAddress
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      commit(
        'setFeeDiscountAccountInfo',
        await fetchFeeDiscountAccountInfo(injectiveAddress)
      )
    },

    async fetchTradingRewardsCampaign({ commit }) {
      commit('setTradingRewardsCampaign', await fetchTradingRewardsCampaign())
    },

    async fetchTradeRewardPoints({ commit }) {
      const {
        isUserWalletConnected,
        injectiveAddress
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      commit(
        'setTradeRewardPoints',
        await fetchTradeRewardPoints([injectiveAddress])
      )
    },

    async reset({ commit }) {
      await Promise.resolve(commit('reset'))
    }
  }
)
