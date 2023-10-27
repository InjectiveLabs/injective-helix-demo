import { Campaign } from '@/types'
// todo: remove mock

export const campaignResponse = {
  paging: {
    total: 4
  },
  isClaimable: false,
  startDate: 1698433390401,
  endDate: 1698865390401,
  lastUpdatedAt: 1698433390401,
  campaignEndTime: 1698865390401,
  marketId:
    '0x3bdb3d8b5eb4d362371b72cf459216553d74abdb55eb0208091f7777dd85c8bb',
  totalScore: '9489324828421012',
  users: [
    {
      accountAddress: 'inj1cml96vmptgw99syqrrz8az79xer2pcgp0a885r',
      blockHeight: 395000000,
      blockTime: 1544614248000,
      campaignId: 'campaign-1',
      contractUpdated: false,
      marketId:
        '0x3bdb3d8b5eb4d362371b72cf459216553d74abdb55eb0208091f7777dd85c8bb',
      score: '828421012'
    },
    {
      accountAddress: 'inj1cml96vmptgw99syqrrz8az79xer2pcgp0a885r',
      blockHeight: 395000000,
      blockTime: 1544614248000,
      campaignId: 'campaign-1',
      contractUpdated: false,
      marketId:
        '0x3bdb3d8b5eb4d362371b72cf459216553d74abdb55eb0208091f7777dd85c8bb',
      score: '828421012'
    },
    {
      accountAddress: 'inj1cml96vmptgw99syqrrz8az79xer2pcgp0a885r',
      blockHeight: 395000000,
      blockTime: 1544614248000,
      campaignId: 'campaign-1',
      contractUpdated: false,
      marketId:
        '0x3bdb3d8b5eb4d362371b72cf459216553d74abdb55eb0208091f7777dd85c8bb',
      score: '828421012'
    },
    {
      accountAddress: 'inj1cml96vmptgw99syqrrz8az79xer2pcgp0a885r',
      blockHeight: 395000000,
      blockTime: 1544614248000,
      campaignId: 'campaign-1',
      contractUpdated: false,
      marketId:
        '0x3bdb3d8b5eb4d362371b72cf459216553d74abdb55eb0208091f7777dd85c8bb',
      score: '828421012'
    }
  ]
} as Campaign
