import { defineStore } from 'pinia'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { ReferralDetails } from '@injectivelabs/sdk-ts'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { indexerGrpcReferralApi } from '@/app/Services'
import { registerInvitee, createReferralLink } from '@/store/referral/message'

type ReferralStoreState = {
  feeRecipient: string
  referralDetails: ReferralDetails
}

const initialStateFactory = (): ReferralStoreState => ({
  referralDetails: {
    invitees: [],
    referrerCode: '',
    referrerAddress: '',
    totalCommission: ZERO_IN_BASE,
    totalTradingVolume: ZERO_IN_BASE
  },
  feeRecipient: FEE_RECIPIENT
})

export const useReferralStore = defineStore('referral', {
  state: (): ReferralStoreState => initialStateFactory(),
  getters: {
    isReferrer: (state) => !!state.referralDetails.referrerCode
  },
  actions: {
    registerInvitee,
    createReferralLink,

    async checkCodeAvailability(referralCode: string) {
      try {
        const response = await indexerGrpcReferralApi.fetchReferrerByCode(
          referralCode
        )

        return response
      } catch (e: any) {
        return true
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
          feeRecipient: response.referrer || FEE_RECIPIENT
        })
      } catch (e: any) {
        // silent error handling if user is not a referrer
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
      } catch (e: any) {
        // silent error handling if user is not an invitee
      }
    }
  }
})
