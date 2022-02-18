import { actionTree, mutationTree } from 'typed-vuex'
import { AccountAddress } from '@injectivelabs/ts-types'
import { RefereeInfo } from '@injectivelabs/referral-consumer'
import { backupPromiseCall } from '~/app/utils/async'
import { referralService } from '~/app/Services'

const initialStateFactory = () => ({
  feeRecipient: undefined as AccountAddress | undefined,
  refereeInfo: undefined as RefereeInfo | undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  feeRecipient: initialState.feeRecipient as AccountAddress | undefined,
  refereeInfo: initialState.refereeInfo as RefereeInfo | undefined
})

export type ReferralStoreState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  setFeeRecipient(state: ReferralStoreState, feeRecipient: AccountAddress) {
    state.feeRecipient = feeRecipient
  },

  setRefereeInfo(state: ReferralStoreState, refereeInfo: RefereeInfo) {
    state.refereeInfo = refereeInfo
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
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      await this.app.$accessor.referral.getFeeRecipient(injectiveAddress)
      await this.app.$accessor.referral.getRefereeInfo(injectiveAddress)
    },

    async getRefereeInfo({ commit }, address: AccountAddress) {
      const { refereeInfo } = await referralService.getReferralInfo(address)

      if (refereeInfo) {
        commit('setRefereeInfo', refereeInfo)
      }
    },

    async getFeeRecipient({ commit }, address: AccountAddress) {
      commit('setFeeRecipient', await referralService.getFeeRecipient(address))
    },

    async refer(_, code: string) {
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      await referralService.refer({ address: injectiveAddress, code })

      backupPromiseCall(() =>
        this.app.$accessor.referral.getFeeRecipient(injectiveAddress)
      )
    }
  }
)
