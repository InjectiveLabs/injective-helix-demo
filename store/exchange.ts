import { actionTree, getterTree } from 'typed-vuex'
import { Token } from '@injectivelabs/ui-common'
import { exchangeService, tokenService } from '~/app/Services'
import {
  FeeDiscountAccountInfo,
  TradingRewardsCampaign,
  FeeDiscountSchedule,
  ExchangeParams
} from '~/app/services/exchange'

const initialStateFactory = () => ({
  params: undefined as ExchangeParams | undefined,
  feeDiscountSchedule: undefined as FeeDiscountSchedule | undefined,
  feeDiscountAccountInfo: undefined as FeeDiscountAccountInfo | undefined,
  tradingRewardsCampaign: undefined as TradingRewardsCampaign | undefined,
  tradeRewardsPoints: [] as string[],
  pendingTradeRewardsPoints: [] as string[]
})

const initialState = initialStateFactory()

export const state = () => ({
  params: initialState.params as ExchangeParams | undefined,
  feeDiscountSchedule: initialState.feeDiscountSchedule as
    | FeeDiscountSchedule
    | undefined,
  feeDiscountAccountInfo: initialState.feeDiscountAccountInfo as
    | FeeDiscountAccountInfo
    | undefined,
  tradingRewardsCampaign: initialState.tradingRewardsCampaign as
    | TradingRewardsCampaign
    | undefined,
  tradeRewardsPoints: initialState.tradeRewardsPoints as string[],
  pendingTradeRewardsPoints: initialState.pendingTradeRewardsPoints as string[]
})

export type ExchangeStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setParams(state: ExchangeStoreState, params: ExchangeParams) {
    state.params = params
  },

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

  setPendingTradeRewardPoints(
    state: ExchangeStoreState,
    tradeRewardsPoints: string[]
  ) {
    state.pendingTradeRewardsPoints = tradeRewardsPoints
  },

  reset(state: ExchangeStoreState) {
    const initialState = initialStateFactory()

    state.feeDiscountSchedule = initialState.feeDiscountSchedule
    state.feeDiscountAccountInfo = initialState.feeDiscountAccountInfo
    state.tradingRewardsCampaign = initialState.tradingRewardsCampaign
    state.tradeRewardsPoints = initialState.tradeRewardsPoints
    state.pendingTradeRewardsPoints = initialState.pendingTradeRewardsPoints
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async initFees(_) {
      await this.app.$accessor.exchange.fetchFeeDiscountSchedule()
      await this.app.$accessor.exchange.fetchFeeDiscountAccountInfo()
    },

    async initTradeAndEarn(_) {
      await this.app.$accessor.exchange.fetchParams()
      await this.app.$accessor.exchange.fetchTradingRewardsCampaign()
      await this.app.$accessor.exchange.fetchTradeRewardPoints()
      await this.app.$accessor.exchange.fetchPendingTradeRewardPoints()
      await this.app.$accessor.exchange.fetchFeeDiscountAccountInfo()
    },

    async fetchParams({ commit }) {
      commit('setParams', await exchangeService.fetchParams())
    },

    async fetchFeeDiscountSchedule({ commit }) {
      const feeDiscountSchedule = await exchangeService.fetchFeeDiscountSchedule()

      if (feeDiscountSchedule) {
        const quoteTokenMeta = (await Promise.all(
          feeDiscountSchedule.quoteDenomsList.map(tokenService.getDenomToken)
        )) as Token[]

        const feeDiscountScheduleWithToken = {
          ...feeDiscountSchedule,
          quoteTokenMeta
        } as FeeDiscountSchedule

        commit('setFeeDiscountSchedule', feeDiscountScheduleWithToken)
      }
    },

    async fetchFeeDiscountAccountInfo({ commit }) {
      const {
        isUserWalletConnected,
        injectiveAddress
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      const feeDiscountAccountInfo = await exchangeService.fetchFeeDiscountAccountInfo(
        injectiveAddress
      )

      if (feeDiscountAccountInfo) {
        commit('setFeeDiscountAccountInfo', feeDiscountAccountInfo)
      }
    },

    async fetchTradingRewardsCampaign({ commit }) {
      const tradingRewardsCampaign = await exchangeService.fetchTradingRewardsCampaign()

      if (tradingRewardsCampaign) {
        const quoteDenomsList = tradingRewardsCampaign.tradingRewardCampaignInfo
          ? tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList
          : []
        const quoteSymbolsList = ((
          await Promise.all(
            quoteDenomsList.map(
              async (denom) => await tokenService.getDenomToken(denom)
            )
          )
        ).filter((token) => token) as Token[]).map((token) => token.symbol)

        const tradingRewardCampaignInfo = {
          ...tradingRewardsCampaign.tradingRewardCampaignInfo,
          quoteSymbolsList
        }
        const tradingRewardsCampaignWithToken = {
          ...tradingRewardsCampaign,
          tradingRewardCampaignInfo
        } as TradingRewardsCampaign

        commit('setTradingRewardsCampaign', tradingRewardsCampaignWithToken)
      }
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
        await exchangeService.fetchTradeRewardPoints([injectiveAddress])
      )
    },

    async fetchPendingTradeRewardPoints({ commit, state }) {
      const {
        isUserWalletConnected,
        injectiveAddress
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      const { params, tradingRewardsCampaign } = state

      if (!params || !tradingRewardsCampaign) {
        return
      }

      const [
        currentCampaignSchedule
      ] = tradingRewardsCampaign.tradingRewardPoolCampaignScheduleList

      if (!currentCampaignSchedule) {
        return
      }

      const campaignStartTimestamp = currentCampaignSchedule.startTimestamp
      const pendingPoolTimestamp = campaignStartTimestamp

      commit(
        'setPendingTradeRewardPoints',
        await exchangeService.fetchPendingTradeRewardPoints(
          [injectiveAddress],
          pendingPoolTimestamp
        )
      )
    },

    async reset({ commit }) {
      await Promise.resolve(commit('reset'))
    }
  }
)
