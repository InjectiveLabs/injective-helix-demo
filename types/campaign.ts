import { Pagination } from '@injectivelabs/sdk-ts'

// todo: move campaign typing to sdk-ts

export interface CampaignUser {
  accountAddress: string
  blockHeight: number
  blockTime: number
  campaignId: string
  contractUpdated: boolean
  marketId: string
  score: string
}

export interface Campaign {
  marketId: string
  isClaimable: boolean
  totalScore: string
  startDate: number
  endDate: number
  lastUpdatedAt: number
  campaignEndTime: number
  users: CampaignUser[]
  paging: Pagination
}
