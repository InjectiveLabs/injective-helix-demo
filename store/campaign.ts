import { defineStore } from 'pinia'
import { campaignResponse } from '@/app/data/campagin'
import { Campaign } from '@/types'

type CampaignStoreState = {
  campaign?: Campaign
  userCount: number
}

const initialStateFactory = (): CampaignStoreState => ({
  campaign: undefined,
  userCount: 0
})

export const useCampaignStore = defineStore('Campaign', {
  state: (): CampaignStoreState => initialStateFactory(),
  actions: {
    async fetchCampaign({
      skip,
      limit,
      marketId
    }: {
      skip?: number
      limit?: number
      marketId: string
    }) {
      const campaignStore = useCampaignStore()

      // eslint-disable-next-line no-console
      console.log({ skip, limit, marketId })

      // show loading spinner
      await new Promise((resolve) => {
        setTimeout(resolve, 3000)
      })

      campaignStore.$patch({
        campaign: campaignResponse,
        userCount: campaignResponse?.paging?.total || 0
      })
    }
  }
})
