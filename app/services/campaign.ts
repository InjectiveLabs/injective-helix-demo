import { HttpClient } from '@injectivelabs/utils'
import { Campaign, CampaignUser, Pagination } from '@injectivelabs/sdk-ts'
import { CAMPAIGN_ID } from '@/app/utils/constants'

const httpClient = new HttpClient('https://15.235.87.88:4449/api/campaigns/v1/')

export const fetchCampaign = async ({
  skip,
  limit,
  accountAddress
}: {
  skip?: number
  limit?: number
  accountAddress?: string
}) => {
  const { data } = (await httpClient.get(`${CAMPAIGN_ID}/ranking`, {
    skip,
    limit,
    accountAddress
  })) as {
    data: {
      campaign: Campaign
      users: CampaignUser[]
      paging: Pagination
    }
  }

  return data
}
