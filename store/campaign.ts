import { defineStore } from 'pinia'
import { indexerGrpcCampaignApi } from '@/app/Services'
import { campaignResponse } from '@/app/data/campaign'
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

      // no data/env to test this at the moment, Hillari said he will set up mainnet for testing
      const campaign = await indexerGrpcCampaignApi.fetchCampaign({
        marketId:
          '0xa508cb32923323679f29a032c70342c147c17d0145625922b0ef22e955c844c0',
        campaignId: 'spot-grid-inj-usdt-test'
      })

      // eslint-disable-next-line no-console
      console.log({ campaign })

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
