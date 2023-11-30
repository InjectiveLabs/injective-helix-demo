import { IS_TESTNET } from '@/app/utils/constants'
import { Epoch, CampaignRound, CampaignWithScAndRound } from '@/types'

export const thumbnailMap = {
  1: '/guild/thumbnail/shield.svg',
  2: '/guild/thumbnail/sword.svg',
  3: '/guild/thumbnail/flag.svg',
  4: '/guild/thumbnail/diamond.svg',
  5: '/guild/thumbnail/saber.svg',
  6: '/guild/thumbnail/knight.svg',
  7: '/guild/thumbnail/shield-yellow.svg',
  8: '/guild/thumbnail/sword-green.svg',
  9: '/guild/thumbnail/quant.png',
  10: '/guild/thumbnail/berbs.png',
  11: '/guild/thumbnail/saber-pink.svg',
  12: '/guild/thumbnail/knight-gray.svg'
} as Record<string, string>

export const guildDescriptionMap = {
  '25269b': 'The Quants > Premier Berbs',
  ef3bc2:
    'Just a guild started by a whale. If you are a fellow whale, this is the guild for you!'
} as Record<string, string>

const mainnetEpochs: Epoch[] = [
  {
    epoch: 1,
    campaignId: 'spot-grid-tia-usdt',
    startDate: 1698753600,
    endDate: 1699974000,
    baseRewards: '1000',
    quoteRewards: '10000',
    scAddress: 'inj1u5hslmdxksvu04d5wk8ec5ewxgpnrs5jxl75rm'
  },

  {
    epoch: 2,
    campaignId: 'spot-grid-tia-usdt-2',
    startDate: 1699974000,
    endDate: 1702566000,
    baseRewards: '500',
    quoteRewards: '4000',
    scAddress: ''
  }
]

const testnetEpochs: Epoch[] = [
  {
    epoch: 1,
    campaignId: 'spot-grid-tia-usdt-test-1',
    startDate: 1699974000,
    endDate: 1699974000,
    baseRewards: '1000',
    quoteRewards: '10000',
    scAddress: ''
  }
]

export const LP_EPOCHS = IS_TESTNET ? testnetEpochs : mainnetEpochs

const testnetCampaignRounds: CampaignRound[] = [
  {
    round: 1,
    startDate: 1698753600,
    endDate: 1699974000,
    campaigns: [
      {
        campaignId: 'spot-grid-inj-usdt-test',
        scAddress: 'inj1tze0el9kvnw06mha3gty6fqcmn2t7efqpzz6pj',
        marketSlug: 'inj-usdt',
        rewards: [
          { symbol: 'INJ', amount: '500' },
          { symbol: 'TIA', amount: '5000' }
        ]
      }
    ]
  },
  {
    round: 2,
    startDate: 1699974000,
    endDate: 1702566000,
    campaigns: [
      {
        campaignId: 'spot-grid-inj-usdt-test-2',
        scAddress: 'inj1tze0el9kvnw06mha3gty6fqcmn2t7efqpzz6pj',
        marketSlug: 'inj-usdt',
        rewards: [
          { symbol: 'INJ', amount: '502' },
          { symbol: 'TIA', amount: '5002' }
        ]
      },
      {
        campaignId: 'spot-grid-tia-usdt-test-1',
        scAddress: 'inj1tze0el9kvnw06mha3gty6fqcmn2t7efqpzz6pj',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '501' },
          { symbol: 'TIA', amount: '5001' }
        ]
      }
    ]
  }
]

const mainnetCampaignRounds: CampaignRound[] = [
  {
    round: 1,
    startDate: 1698753600,
    endDate: 1699974000,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt',
        scAddress: 'inj1u5hslmdxksvu04d5wk8ec5ewxgpnrs5jxl75rm',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '1000' },
          { symbol: 'TIA', amount: '10000' }
        ]
      }
    ]
  },
  {
    round: 2,
    startDate: 1699974000,
    endDate: 1702339200,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-2',
        scAddress: '',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '500' },
          { symbol: 'TIA', amount: '4000' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-2',
        scAddress: '',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '62500' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-2',
        scAddress: '',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '500' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-2',
        scAddress: '',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '500' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-2',
        scAddress: '',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-2',
        scAddress: '',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      }
    ]
  }
]

export const CAMPAIGN_LP_ROUNDS = IS_TESTNET
  ? testnetCampaignRounds
  : mainnetCampaignRounds

export const LP_CAMPAIGNS = CAMPAIGN_LP_ROUNDS.reduce<CampaignWithScAndRound[]>(
  (campaigns, round) => [
    ...campaigns,
    ...round.campaigns.map((campaign) => ({
      ...campaign,
      round: round.round,
      endDate: round.endDate,
      startDate: round.startDate
    }))
  ],
  []
)
