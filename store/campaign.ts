import { defineStore } from 'pinia'
import { Campaign, CampaignUser } from '@injectivelabs/sdk-ts'
import { indexerGrpcCampaignApi } from '@/app/Services'
import { CAMPAIGN_ID } from 'app/utils/constants'

type CampaignStoreState = {
  campaign?: Campaign
  totalUserCount: number
  campaignUsers: CampaignUser[]
  ownerCampaignInfo?: CampaignUser
}

const initialStateFactory = (): CampaignStoreState => ({
  totalUserCount: 0,
  campaignUsers: [],
  campaign: undefined,
  ownerCampaignInfo: undefined
})

export const useCampaignStore = defineStore('campaign', {
  state: (): CampaignStoreState => initialStateFactory(),
  actions: {
    async fetchCampaign({ skip, limit }: { skip?: number; limit?: number }) {
      const campaignStore = useCampaignStore()

      const { campaign, paging, users } =
        await indexerGrpcCampaignApi.fetchCampaign({
          limit,
          skip: `${skip}`,
          campaignId: CAMPAIGN_ID
        })

      campaignStore.$patch({
        campaign,
        campaignUsers: users,
        totalUserCount: paging?.total || 0
      })
    },

    async fetchCampaignOwnerInfo() {
      const campaignStore = useCampaignStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const { users } = await indexerGrpcCampaignApi.fetchCampaign({
        limit: 1,
        skip: '0',
        campaignId: CAMPAIGN_ID,
        accountAddress: walletStore.injectiveAddress
      })

      campaignStore.$patch({
        ownerCampaignInfo: users[0]
      })
    }
  }
})
