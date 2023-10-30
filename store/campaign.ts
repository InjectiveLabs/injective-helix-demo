import { defineStore } from 'pinia'
import { Campaign, CampaignUser } from '@injectivelabs/sdk-ts'
// import { indexerGrpcCampaignApi } from '@/app/Services'
import { fetchCampaign } from '@/app/services/campaign'

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

      const { campaign, paging, users } = await fetchCampaign({
        skip,
        limit
      })

      campaignStore.$patch({
        campaign,
        campaignUsers: users,
        totalUserCount: paging?.total || 0
      })
    },

    async fetchCampaignOwnerInfo() {
      const campaignStore = useCampaignStore()
      // const walletStore = useWalletStore()

      const { users } = await fetchCampaign({
        limit: 1,
        // accountAddress: walletStore.injectiveAddress
        // hardcoded for testing purposes
        accountAddress: 'inj1xk2pwh0tl6hdwv7z98mz6wjjhmfgl2h32p0x04'
      })

      campaignStore.$patch({
        ownerCampaignInfo: users[0]
      })
    }
  }
})
