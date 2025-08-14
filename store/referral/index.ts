import { defineStore } from 'pinia'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { indexerGrpcReferralApi } from '@/app/Services'
import { registerInvitee, createReferralLink } from '@/store/referral/message'
import type { ReferralDetails } from '@injectivelabs/sdk-ts'

type ReferralStoreState = {
  feeRecipient: string
  referralDetails: ReferralDetails
}

const initialStateFactory = (): ReferralStoreState => ({
  feeRecipient: FEE_RECIPIENT,
  referralDetails: {
    invitees: [],
    referrerCode: '',
    referrerAddress: '',
    totalCommission: ZERO_IN_BASE,
    totalTradingVolume: ZERO_IN_BASE
  }
})

export const useReferralStore = defineStore('referral', {
  state: (): ReferralStoreState => initialStateFactory(),
  getters: {
    isReferrer: (state) => !!state.referralDetails.referrerCode,
    hasBeenReferred: (state) => state.feeRecipient !== FEE_RECIPIENT
  },
  actions: {
    registerInvitee,
    createReferralLink,

    async checkCodeAvailability(referralCode: string) {
      try {
        const response =
          await indexerGrpcReferralApi.fetchReferrerByCode(referralCode)

        return response
      } catch {
        return ''
      }
    },

    async fetchUserReferrer() {
      const referralStore = useReferralStore()
      const sharedWalletStore = useSharedWalletStore()

      try {
        if (!sharedWalletStore.injectiveAddress) {
          return
        }

        const response = await indexerGrpcReferralApi.fetchInviteeDetails(
          sharedWalletStore.authZOrInjectiveAddress
        )

        referralStore.$patch({
          feeRecipient: response?.active ? response.referrer : FEE_RECIPIENT
        })
      } catch {
        // silent error handling if user has no referrer
        referralStore.$patch({ feeRecipient: FEE_RECIPIENT })
      }
    },

    async fetchUserReferralDetails() {
      const referralStore = useReferralStore()
      const sharedWalletStore = useSharedWalletStore()

      try {
        if (!sharedWalletStore.injectiveAddress) {
          return
        }

        const response = await indexerGrpcReferralApi.fetchReferrerDetails(
          sharedWalletStore.authZOrInjectiveAddress
        )

        referralStore.$patch({ referralDetails: response || {} })
      } catch {
        // silent error handling if user is not an invitee
        referralStore.$patch({ referralDetails: {} })
      }
    }
  }
})
