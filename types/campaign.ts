import { Campaign } from '@injectivelabs/sdk-ts'
import { Token } from '@injectivelabs/token-metadata'

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
  token: Token
  amount: string
}

export type CampaignWithScAndData = CampaignWithScAndRound & Campaign
