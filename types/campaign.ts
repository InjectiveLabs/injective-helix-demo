import { Campaign, TokenStatic } from '@injectivelabs/sdk-ts'

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

export type CampaignWithScAndRound = {
  round: number
  endDate: number
  startDate: number
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

export type RewardWithToken = {
  token: TokenStatic
  amount: string
}

export type CampaignWithScAndData = CampaignWithScAndRound & Campaign

export type CompetitionResult = {
  prize: string
  hasClaimed: boolean
}
