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
        scAddress: 'inj1zdxx09r6mjzf7tvlrzh330y086wx2uxxy95ync',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '500' },
          { symbol: 'TIA', amount: '4000' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-2',
        scAddress: 'inj1hakchlayslmpcjg0uprtjrw3ndlmfz55gxmxn9',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '62500' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-2',
        scAddress: 'inj1c5qv4cn826kcssrrg4cw2sz4qc92588x9j9703',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '500' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-2',
        scAddress: 'inj107cnwxc7sndzmx68l4py7kkpdl3fx9kgrjnhp0',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '500' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-2',
        scAddress: 'inj167vg2dzv72l9dxk64ka7was5ute4g4gqg0y6ff',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-2',
        scAddress: 'inj1a4tr359lm29gunp09dhx0amqp4w9r0wu0pf4pj',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-2',
        scAddress: 'inj16k0vr5n6ftx3dl84k7qunumxucedumyxkv6a72',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '3000' }]
      }
    ]
  },
  {
    round: 3,
    startDate: 1702339200,
    endDate: 1702944000,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-3',
        scAddress: 'inj1w04r87lvdfc8j0shmsf6pml0ak3hhwq63t8r08',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '125' },
          { symbol: 'TIA', amount: '200' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-3',
        scAddress: 'inj1eu37sua9xzcjycyzfhg02w76slhcczvvqdkm78',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-3',
        scAddress: 'inj1ezkxkna540xll0uanc736thkjfyqv4wltfvqg6',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-3',
        scAddress: 'inj13yqmuce98gv4kfxarsn6679ahpguf2ex3faetr',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-3',
        scAddress: 'inj1mm7qxvlawk948asxzeq957qh5n9s2gv5684y0j',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '125' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-3',
        scAddress: 'inj1ya7jt8p594vmcyr7lt2dpjsmkc29w8kys8rfeu',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '125' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-3',
        scAddress: 'inj1r4vz3wa62stcdt0mu94xvu43cevkkrq2hytnml',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-3',
        scAddress: 'inj18j64370uju9ykqpsk2nd4rxukunrfdag088sdc',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '125' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-3',
        scAddress: 'inj15dq7gjszjujlndmgwmxlsd7cx9h3txlg9zv5mu',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-3',
        scAddress: 'inj1ha2ql5esqa8mv4kl56f4hpl7nanv5h4a4k83ff',
        marketSlug: 'talis-usdt',
        rewards: [{ symbol: 'TALIS', amount: '50000' }]
      }
    ]
  },
  {
    round: 4,
    startDate: 1702944000,
    endDate: 1703548800,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-4',
        scAddress: 'inj1us5053c0qhkml9g09uw68znu5qjnrc5twezalq',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '125' },
          { symbol: 'TIA', amount: '200' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-4',
        scAddress: 'inj1t225czs5qxcercheqq8jvwdny0u6tpac5dd8rz',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-4',
        scAddress: 'inj1l3xq2dr3sh8suehcps8gjrr34f7cxntcguyah9',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-4',
        scAddress: 'inj17wr8puse0null2z0htt8d07mzlcs30rdmel07p',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '250' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-4',
        scAddress: 'inj1880x6ram5h6l2h3pvg96wr7y7wwyvv0537qepy',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '125' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-4',
        scAddress: 'inj1envp2rznjn458tzc8chxt9fpel4zfpzpqzs3ye',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '125' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-4',
        scAddress: 'inj12rx2g07vqzqmepnfeuux5trnla9k4mxjnr47ew',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-4',
        scAddress: 'inj1xa4gx7jjunj7na5razw4ze5jjmjyx8srzdrttn',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '125' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-4',
        scAddress: 'inj1r7ukgglucxmtznqxcksqnq8qkynulszlshlc09',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-4',
        scAddress: 'inj1e45j2utxsw70cynql7ngfurn69trhuyskuqj7c',
        marketSlug: 'talis-usdt',
        rewards: [{ symbol: 'TALIS', amount: '50000' }]
      }
    ]
  },
  {
    round: 5,
    startDate: 1703548800,
    endDate: 1704153600,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-5',
        scAddress: 'inj1y5z9vj37rdspphrjycc0afxy3ujawtnmp76036',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '100' },
          { symbol: 'TIA', amount: '150' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-5',
        scAddress: 'inj1leeuzc4czy4esv8tklfvvsakpmksvnrls6w06e',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-5',
        scAddress: 'inj1xsuje2e0ls3j2rqy0j7d3pjrgmkmwrwnf4eug2',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-5',
        scAddress: 'inj1mm6l0jftes5awe0cgnqyaljedpea8csgwdk78z',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-5',
        scAddress: 'inj155ka6a08tkx32ryskwm00vkqx4cnuhh09kf9ll',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-5',
        scAddress: 'inj1jshaauthrdqpljd39fgvrzh2k2tadgfc3wl0p9',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-5',
        scAddress: 'inj1jklp7rqqpzu7usqrpqqurzkrnuwz7ysx4zkp7t',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-5',
        scAddress: 'inj10ndrn48cdaqxtht5n7uzc0gxc4rvr5dle83t4l',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-5',
        scAddress: 'inj18tdes9vljghxc2vm5jvdx99srsdkq2agemd5fl',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-5',
        scAddress: 'inj1dh03rkcaswp9u2acj9wk0yx5tpyfgvq25787lc',
        marketSlug: 'talis-usdt',
        rewards: [{ symbol: 'TALIS', amount: '25000' }]
      }
    ]
  },
  {
    round: 6,
    startDate: 1704153600,
    endDate: 1704758400,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-6',
        scAddress: 'inj1ty3cm5m40c9jfndnnxh5nllpttuxe2dwwg6g4r',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '100' },
          { symbol: 'TIA', amount: '150' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-6',
        scAddress: 'inj125qeu2qwwm2fxsn3y6w5l2pp5mjtn8j65r3vx7',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-6',
        scAddress: 'inj1d952x8e0syu42q2wq8qktmjp5vwpulgr2hsws9',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-6',
        scAddress: 'inj14ukch5vt2l5ppen8w4cftmk45tgnlmsanyss2m',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-6',
        scAddress: 'inj1ftaw8gnr94m5tgsvpmdfujrupd45j6mr9hcekv',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-6',
        scAddress: 'inj1l30hca0wlj3d7crnujdz4nlphelff4kaa6ks49',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-6',
        scAddress: 'inj15vpafum2z6zqzs9dhuwfyvynpa8k5gc5072qjj',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-6',
        scAddress: 'inj16y0km3sezpnaq6euean26vp4gn3jyyl0met8rg',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-6',
        scAddress: 'inj19u4m22efg0yskuvtrsq49uqrvjqa8uv8xzel0l',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-6',
        scAddress: 'inj1xa4vle8wprndh06fqa277zkz4g9mp8rx62x6wd',
        marketSlug: 'talis-usdt',
        rewards: [{ symbol: 'TALIS', amount: '25000' }]
      }
    ]
  },
  {
    round: 7,
    startDate: 1704758400,
    endDate: 1705363200,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-7',
        scAddress: 'inj1k7f6wlqs8suzkf63d3qa8m63tte6lz9s8qqmys',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '100' },
          { symbol: 'TIA', amount: '150' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-7',
        scAddress: 'inj1m4kw2h2d9ngukazenmsm4j4d46aqv47zkehj35',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-7',
        scAddress: 'inj1g4edcezaekjzm7hen6d9zx3e644y4pkwc8eg4p',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-7',
        scAddress: 'inj1dpldr7wg2wddrkp28pdaqulac8l52wwlwmsdlh',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-7',
        scAddress: 'inj1y3elqnp6u74nh0dp4d60dpcxqlutsw3hzy6lq3',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-7',
        scAddress: 'inj1d2qdsvg6pe4fl4wqqahzyxg0n370nxuh7wy3rz',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-7',
        scAddress: 'inj1vj08nhqymy9atd42gdl54z4u6vmj9gh7qgjqqm',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-7',
        scAddress: 'inj1f8hflpkjww35jn7yeqp7hzu9sv2rl9999qdgxc',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-7',
        scAddress: 'inj10w434g0ad84jtejy6lq3acpfpjh0jpczs58e07',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-7',
        scAddress: 'inj1ps5vzdg5tdcppdljzytfrdu5n4dj4m3nqfczkq',
        marketSlug: 'talis-usdt',
        rewards: [{ symbol: 'TALIS', amount: '25000' }]
      }
    ]
  },
  {
    round: 8,
    startDate: 1705363200,
    endDate: 1705968000,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-8',
        scAddress: '',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '100' },
          { symbol: 'TIA', amount: '150' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-8',
        scAddress: '',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-8',
        scAddress: '',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-8',
        scAddress: '',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-8',
        scAddress: '',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-8',
        scAddress: '',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-8',
        scAddress: '',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-8',
        scAddress: '',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-8',
        scAddress: '',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-8',
        scAddress: '',
        marketSlug: 'talis-usdt',
        rewards: [{ symbol: 'TALIS', amount: '25000' }]
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
