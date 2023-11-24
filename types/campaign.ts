export type Epoch = {
  epoch: number
  campaignId: string
  endDate: number
  startDate: number
  baseRewards: string
  quoteRewards: string
  scAddress: string
}

export type CampaignWithSc = {
  campaignId: string
  marketSlug: string
  rewards: { symbol: string; amount: string }[]
  scAddress: string
}

export type CampaignRound = {
  round: number
  startDate: number
  endDate: number
  campaigns: CampaignWithSc[]
}
