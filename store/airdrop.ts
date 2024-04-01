import { defineStore } from 'pinia'
import {
  toBase64,
  fromBase64,
  MsgExecuteContractCompat
} from '@injectivelabs/sdk-ts'
import { Coin } from '@injectivelabs/ts-types'
import { BigNumberInWei } from '@injectivelabs/utils'
import { msgBroadcastClient, wasmApi } from '@/app/Services'

const REWARDS_CONTRACT = 'inj135qvnawxk6llfchya2fve7cw4aukmg0xfz9ea7'
const CAMPAIGN_ID = 1

type AirdropStoreState = {
  //
}

const initialStateFactory = (): AirdropStoreState => ({
  //
})

export const useAirdropStore = defineStore('airdrop', {
  state: (): AirdropStoreState => initialStateFactory(),
  actions: {
    async fetchUserClaimStatus(injectiveAddress: string) {
      const response = (await wasmApi.fetchSmartContractState(
        REWARDS_CONTRACT,
        toBase64({
          user_has_claimed: {
            campaign_id: CAMPAIGN_ID,
            user: injectiveAddress
          }
        })
      )) as unknown as { data: string }

      return fromBase64(response.data) as unknown as boolean
    },

    async fetchUserEligibleAirdrop(injectiveAddress: string) {
      const response = (await wasmApi.fetchSmartContractState(
        REWARDS_CONTRACT,
        toBase64({
          user_reward: {
            campaign_id: CAMPAIGN_ID,
            user: injectiveAddress
          }
        })
      )) as unknown as { data: string }

      const [userReward] = fromBase64(response.data) as unknown as Coin[]

      return new BigNumberInWei(userReward.amount || 0)
    },

    async claim() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.queue()
      await walletStore.validate()

      if (!walletStore.address) {
        return
      }

      const message = MsgExecuteContractCompat.fromJSON({
        sender: walletStore.injectiveAddress,
        contractAddress: REWARDS_CONTRACT,
        exec: {
          action: 'claim_reward',
          msg: { campaign_id: CAMPAIGN_ID }
        }
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        msgs: [message],
        injectiveAddress: walletStore.injectiveAddress
      })
    }
  }
})
