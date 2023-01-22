import { defineStore } from 'pinia'
import { AccountAddress } from '@injectivelabs/ts-types'
import { RefereeInfo, ReferrerInfo } from '@injectivelabs/referral-consumer'
import {
  getFeeRecipient,
  getReferralInfo,
  refer
} from '@/app/services/referrals'
import { REFERRALS_ENABLED } from '@/app/utils/constants'

type ReferralStoreState = {
  feeRecipient?: AccountAddress
  refereeInfo?: RefereeInfo
  referrerInfo?: ReferrerInfo
}

const initialStateFactory = (): ReferralStoreState => ({
  feeRecipient: undefined,
  refereeInfo: undefined,
  referrerInfo: undefined
})

export const useReferralStore = defineStore('referral', {
  state: (): ReferralStoreState => initialStateFactory(),
  actions: {
    async init() {
      const referralStore = useReferralStore()
      const { injectiveAddress, isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      if (!REFERRALS_ENABLED) {
        return
      }

      await referralStore.getFeeRecipient(injectiveAddress)
      await referralStore.getRefereeInfo(injectiveAddress)
    },

    async getRefereeInfo(address: AccountAddress) {
      const referralStore = useReferralStore()

      if (!REFERRALS_ENABLED) {
        return
      }

      const { refereeInfo, referrerInfo } = await getReferralInfo(address)

      if (refereeInfo) {
        referralStore.$patch({
          refereeInfo
        })
      }

      if (referrerInfo) {
        referralStore.$patch({
          referrerInfo
        })
      }
    },

    async getFeeRecipient(address: AccountAddress) {
      const referralStore = useReferralStore()

      if (!REFERRALS_ENABLED) {
        return
      }

      referralStore.$patch({
        feeRecipient: await getFeeRecipient(address)
      })
    },

    async refer(code: string) {
      const referralStore = useReferralStore()
      const { injectiveAddress, isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      if (!REFERRALS_ENABLED) {
        return
      }

      await refer({ address: injectiveAddress, code })

      await referralStore.getFeeRecipient(injectiveAddress)
      await referralStore.getRefereeInfo(injectiveAddress)
    }
  }
})
