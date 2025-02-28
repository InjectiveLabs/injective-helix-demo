import { defineStore } from 'pinia'
import { wasmApi } from '@shared/Service'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { toBase64, fromBase64 } from '@injectivelabs/sdk-ts'
import { FEE_RECIPIENT, REFERRAL_CONTRACT_ADDRESS } from '@/app/utils/constants'
import { ReferralDetails } from '@/types'

import { registerInvitee, createReferralLink } from '@/store/referral/message'

type ReferralStoreState = {
  feeRecipient: string
  referralDetails: ReferralDetails
}

const initialStateFactory = (): ReferralStoreState => ({
  referralDetails: {},
  feeRecipient: FEE_RECIPIENT
})

export const useReferralStore = defineStore('referral', {
  state: (): ReferralStoreState => initialStateFactory(),
  getters: {
    isReferrer: (state) => !!state.referralDetails.code,
    rewardsEarned: (state) =>
      state.referralDetails?.all_invitees?.reduce(
        (total, item) => total.plus(new BigNumberInBase(item.commission)),
        ZERO_IN_BASE
      )
  },
  actions: {
    registerInvitee,
    createReferralLink,

    async checkCodeAvailability(referralCode: string) {
      const response = (await wasmApi.fetchSmartContractState(
        REFERRAL_CONTRACT_ADDRESS,
        toBase64({
          get_referrer_by_code: { code: referralCode }
        })
      )) as unknown as { data: string }

      return !fromBase64(response.data)?.length
    },

    // todo fred: replace this with proper "indexer" integration when available
    async fetchUserReferrer() {
      const referralStore = useReferralStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.injectiveAddress) {
        return
      }

      const response = (await wasmApi.fetchSmartContractState(
        REFERRAL_CONTRACT_ADDRESS,
        toBase64({
          get_referral: { referree: sharedWalletStore.injectiveAddress }
        })
      )) as unknown as { data: string }

      referralStore.$patch({
        feeRecipient: fromBase64(response.data)?.[0]?.address || FEE_RECIPIENT
      })
    },

    // todo fred: replace this with proper "indexer" integration when available
    async fetchUserReferralDetails() {
      const referralStore = useReferralStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.injectiveAddress) {
        return
      }

      const isReferrerResponse = (await wasmApi.fetchSmartContractState(
        REFERRAL_CONTRACT_ADDRESS,
        toBase64({
          get_code_by_referrer: { referrer: sharedWalletStore.injectiveAddress }
        })
      )) as unknown as { data: string }

      const referrerData = fromBase64(isReferrerResponse.data)?.[0] || {}

      if (referrerData.code) {
        const response = (await wasmApi.fetchSmartContractState(
          REFERRAL_CONTRACT_ADDRESS,
          toBase64({
            get_all_referrals: { code: referrerData.code }
          })
        )) as unknown as { data: string }

        // todo fred: temp until SC add support
        const formattedAllInvitees = fromBase64(response.data).map(
          (item: any) => ({
            ...item,
            commission: '188',
            timestamp: '2025-01-25'
          })
        )

        referrerData.all_invitees = formattedAllInvitees
      }

      referralStore.$patch({
        referralDetails: referrerData || {}
      })
    }
  }
})
