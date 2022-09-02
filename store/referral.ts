import { actionTree, mutationTree } from 'typed-vuex'
import { AccountAddress } from '@injectivelabs/ts-types'
import { RefereeInfo, ReferrerInfo } from '@injectivelabs/referral-consumer'
import {
  getFeeRecipient,
  getReferralInfo,
  refer
} from '~/app/services/referrals'
import { REFERRALS_ENABLED } from '~/app/utils/constants'

const initialStateFactory = () => ({
  feeRecipient: undefined as AccountAddress | undefined,
  refereeInfo: undefined as RefereeInfo | undefined,
  referralInfo: undefined as ReferrerInfo | undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  feeRecipient: initialState.feeRecipient as AccountAddress | undefined,
  refereeInfo: initialState.refereeInfo as RefereeInfo | undefined,
  referrerInfo: initialState.refereeInfo as ReferrerInfo | undefined
})

export type ReferralStoreState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  setFeeRecipient(state: ReferralStoreState, feeRecipient: AccountAddress) {
    state.feeRecipient = feeRecipient
  },

  setRefereeInfo(state: ReferralStoreState, refereeInfo: RefereeInfo) {
    state.refereeInfo = refereeInfo
  },

  setReferrerInfo(state: ReferralStoreState, referrerInfo: ReferrerInfo) {
    state.referrerInfo = referrerInfo
  },

  reset(state: ReferralStoreState) {
    const initialState = initialStateFactory()

    state.feeRecipient = initialState.feeRecipient
    state.refereeInfo = initialState.refereeInfo
  }
})

export const actions = actionTree(
  { state, mutations },
  {
    async init(_) {
      const { injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      if (!REFERRALS_ENABLED) {
        return
      }

      await this.app.$accessor.referral.getFeeRecipient(injectiveAddress)
      await this.app.$accessor.referral.getRefereeInfo(injectiveAddress)
    },

    async getRefereeInfo({ commit }, address: AccountAddress) {
      if (!REFERRALS_ENABLED) {
        return
      }

      const { refereeInfo, referrerInfo } = await getReferralInfo(address)

      if (refereeInfo) {
        commit('setRefereeInfo', refereeInfo)
      }

      if (referrerInfo) {
        commit('setReferrerInfo', referrerInfo)
      }
    },

    async getFeeRecipient({ commit }, address: AccountAddress) {
      if (!REFERRALS_ENABLED) {
        return
      }

      const feeRecipient = await getFeeRecipient(address)

      commit('setFeeRecipient', feeRecipient)
    },

    async refer(_, code: string) {
      const { injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      if (!REFERRALS_ENABLED) {
        return
      }

      await refer({ address: injectiveAddress, code })

      await this.app.$accessor.referral.getFeeRecipient(injectiveAddress)
      await this.app.$accessor.referral.getRefereeInfo(injectiveAddress)
    }
  }
)
