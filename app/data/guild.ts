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

// OLP addresses are not allowed to join the TIA guild competition
export const prohibitedAddresses = [
  'inj1akxycslq8cjt0uffw4rjmfm3echchptu52a2dq',
  'inj1xyc8au3vwlxgnnt7vyjxvz83twpdp8lde3qmkg',
  'inj1rwv4zn3jptsqs7l8lpa3uvzhs57y8duemete9e',
  'inj1y9vkk3ga59gq96amj9np7l67nuhnwg6rv4a06j',
  'inj1mcys5v244eelwr8c0xpg3c9ac2m2add5saytyh',
  'inj14k7wgey85pt226ugr9sq4h2ya774n82hzy26nf',
  'inj1n5dfuan908fdlxxkjt9xajt8s9lt40v0x4g9yw',
  'inj1as4jrta885z3zn37a2z3xk9cddt8dyzmfvwemw',
  'inj1ek6d8fxfh485adwr9mznkvtrm664g9eaz5s4l6',
  'inj10xvv532h2sy03d86x487v9dt7dp4eud8fe2qv5',
  'inj12vpajtjf5cvmk2w737m0t8qwwkyjz0xgvxwyus',
  'inj13glcnaum2xqv5a0n0hdsmv0f6nfacjsfvrh5j9',
  'inj1clj2aeqaw2z3529jqp7qyhhg3uhlnk9hk0j0zz',
  'inj1pdrwxwts36jds77jlnrpv98ppxkrwja7hc2659',
  'inj1dx4pxhzc2a0dv9htu3xzqk53r4q6tthwqn4562',
  'inj19qwtymgvs5qa57flxp9gc0h0sazd78hwpenqu2',
  'inj1kukxjpf0c2s2rzt8v2s89gtrfh7waywa85m0fu',
  'inj1ju48ulgakgclvlne0lx0h5zdzluztlx7suwq7z'
]

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
    endDate: 1702566000,
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
