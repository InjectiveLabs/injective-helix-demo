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
        scAddress: 'inj1zzsncs559yra9vzrm7r5ut5kkvgc6jj635pt5w',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '100' },
          { symbol: 'TIA', amount: '150' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-8',
        scAddress: 'inj19j7kxl4456wh9fhzjnmtya3jzdlz76v8yw8nwu',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-8',
        scAddress: 'inj1k6wgn5annnxa07xjca3tnhz9zfrp57zlrqu3c5',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-8',
        scAddress: 'inj1p0ex8uk8rtafndkzp68rpmjl6yhq6fm3n4j29c',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-8',
        scAddress: 'inj144lxmu9200r6gnwyrq9kta6mamjnwxtpp323yd',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-8',
        scAddress: 'inj1s9qax6uzneqpfy342dxlpzg7auhykzcdxrs2sv',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-8',
        scAddress: 'inj1kdjrtqj4dn4rkg98rzyqersq0v0npxcedy73ht',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-8',
        scAddress: 'inj1cdj8s5zku2f28r6343hd3a62k4qtfgypq8zuvj',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-8',
        scAddress: 'inj1d3ka7dz2l3zfupayjm79hyjv8aleplzzn7027w',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-8',
        scAddress: 'inj1xmrs24ktl87jef4znr2szy57nhw2fx2r2hcuz3',
        marketSlug: 'talis-usdt',
        rewards: [{ symbol: 'TALIS', amount: '25000' }]
      }
    ]
  },
  {
    round: 9,
    startDate: 1705968000,
    endDate: 1706572800,
    campaigns: [
      {
        campaignId: 'spot-grid-tia-usdt-9',
        scAddress: '',
        marketSlug: 'tia-usdt',
        rewards: [
          { symbol: 'INJ', amount: '100' },
          { symbol: 'TIA', amount: '150' }
        ]
      },
      {
        campaignId: 'spot-grid-whale-usdt-9',
        scAddress: '',
        marketSlug: 'whale-usdt',
        rewards: [{ symbol: 'WHALE', amount: '31250' }]
      },
      {
        campaignId: 'spot-grid-weth-usdt-9',
        scAddress: '',
        marketSlug: 'weth-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-atom-usdt-9',
        scAddress: '',
        marketSlug: 'atom-usdt',
        rewards: [{ symbol: 'INJ', amount: '200' }]
      },
      {
        campaignId: 'spot-grid-stinj-inj-9',
        scAddress: '',
        marketSlug: 'stinj-inj',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-wmatic-usdt-9',
        scAddress: '',
        marketSlug: 'wmatic-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-usdtkv-usdt-9',
        scAddress: '',
        marketSlug: 'usdtkv-usdt',
        rewards: [{ symbol: 'KAVA', amount: '1500' }]
      },
      {
        campaignId: 'spot-grid-arb-usdt-9',
        scAddress: '',
        marketSlug: 'arb-usdt',
        rewards: [{ symbol: 'INJ', amount: '100' }]
      },
      {
        campaignId: 'spot-grid-kuji-usdt-9',
        scAddress: '',
        marketSlug: 'kuji-usdt',
        rewards: [{ symbol: 'INJ', amount: '50' }]
      },
      {
        campaignId: 'spot-grid-talis-usdt-9',
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

export const FIRST_CAMPAIGN_NAME =
  'Helix Like a G Trading Competition Leaderboard'

export const UPCOMING_LEADERBOARD_CAMPAIGN_NAME = ''

export const additionalEntriesMap: Record<string, Record<string, number>> = {
  [FIRST_CAMPAIGN_NAME]: {
    inj15dsfeau89748sppgr379akut95esqyyf4ejs92: 375960,
    inj152nhgl25zrdtl5x7772mqztuulcyderc4ekned: 141196,
    inj14wz8l5lxzscuxvmgj9tpn2fc934xey988rz0wk: 70504,
    inj1pwyzkut2dlaw75hldfz4rg86g2jrhhrphdkj40: 23868,
    inj1n7d89dzf0qlx5l56lj3wlfy6ddmhjd24q5e8q9: 20080,
    inj122c6jktvt3w264rhfzmvw8kwasng9s4hq5h329: 9516,
    inj1wp26ke3mkzvsk7nnpdecfneg6ef9ewucpjtvnx: 8416,
    inj1nsvlrw4cg00ppu55lknkj6zuxzwvl0yrknjksg: 5744,
    inj1ud3dwcj0uezdhdhxfmknpmtmvwqh3evds6zl88: 5252,
    inj12vgv636flakn4ywpjhr29as6yvngd7h3s3k4ar: 3128,
    inj1geagrhhgpknp7z9n5lpmv2udw2e3s57q8uxeqe: 1668,
    inj1qnkzj0ph62q0fkpy9s6vhda8rcjxe5y846ueel: 1456,
    inj1uf7p5nd0uxmmujcdzc7d4cswnh6msd2rggpj4j: 1172,
    inj1rchqm749hzx7s4y5ajc0hra4v26gca6lcgv4hh: 852,
    inj14k7wgey85pt226ugr9sq4h2ya774n82hzy26nf: 784,
    inj1m64jl4h53972smg8wfjdd5m8a2nqj3qg45543y: 752,
    inj1a4kpqqj9pjl5rr5k693krjld82zrvmzrvzlgym: 692,
    inj1rt3n0tql8a59yfhvz6rweggszqcekcdtwmd9mt: 576,
    inj1ne9kfskk344smyz55drn5rrpgt7yhzz49z4sfa: 556,
    inj1j6v7f84072u9juckqltezvufpf6svlra9z6ruv: 528,
    inj1dhykpvvev4t2retlx7m5uqmegqfm08kfafq2gs: 388,
    inj1aqfysw4xvrrdm8ap9kh9rlhagrk0h5xmyst89m: 388,
    inj1xsfg92tzruq3x96sypag9zkdwuvyqe62eec8pw: 280,
    inj1zpkga0nr77tlqzu59hcevhrlyed3sw9luhu0tz: 272,
    inj1n7c5pu85yahgkgu6gyasl4gya9dl3emr62f5d8: 252,
    inj1tqrr60q0flta4m53uzn6dpntlsr4x56j32pytf: 252,
    inj1kxhfvyz5xcx9t4h44qgfecnvevr9ahgkf9xz83: 252,
    inj15wn7dtshtqm43mz4pad4fmumk4l8zcwq7qkg7l: 240,
    inj1cmkfhk63ma5kc4f6jf6586negp8v4pcydcznj5: 232,
    inj15t8hfhve92wusln6k0pkvusjqalh434ugl36j9: 224,
    inj1tmkgxm7wmqzlqm5rnx02zccqhx8u98qqltgsf3: 216,
    inj12mhuwj2kltzcfm2x956wsnkujlh0q0tfyykpzm: 208,
    inj1vwjk9cz8uyzsrk0f3uvul27qyhdv9rujay4e8x: 200,
    inj10uen9k593sll79n9egwh80t09enk7gsaqqehuh: 196,
    inj1g924dcw4hmxdvzxhg6qrm94qtr708pgc9n2u2k: 184,
    inj12exesr09srx4unfa58e0xu8te7udyj2aczdevv: 140,
    inj1c0nt3zyjkk7vj4lwk5t4zl9yjpw7py4mykwrvp: 132,
    inj1tx8mv62yfnz5x3z46jf70n3c3jmpnypvwtetkg: 116,
    inj16dlgtcw899g99cgz88laxd6fjyrccreuxu2zk3: 104,
    inj134cx8g304mh3mujxnqew4fxqfeqsh2a4gg4q4c: 104,
    inj1qg6k8s2yf8c0fc58wcwck08juju4hlrlss9tkm: 100,
    inj12acd66kua4rdugguq3rgg6wcrj2dkjsxkhznfm: 100,
    inj1lhzemj4qqaluz79u7yhe6emuhe64z822cn8zjp: 96,
    inj1wdfzn2wdaqyu00zqnyruqqr3tdv29mnxq753xc: 88,
    inj1myt4ld2gqtpguc680dz7d49f3pxxdxdemfclaf: 88,
    inj1uxpnt440y2n75cn8fzp785cj4z7w3jqgjm8a05: 76,
    inj1lu27dkp8p50ckdnkme3gm2qschg8856dzdngaa: 68,
    inj1pkgpfmkergk4spadj4t49utypdfswyuhd8daps: 56,
    inj1th0esjlhhn66att5d65axlwhkv3qeqgsj2mmuc: 56,
    inj1xw2vmtpmh66mwmz8vvwru3vsk4r2pl3nfhxl0d: 56,
    inj1ph7ytd6ncqw6yfmeh7xr6su470c0rke5yzdxv6: 56,
    inj1egaye6hwrruuslcfxaxmwq69767wx4948h4mld: 40,
    inj1zm6d08w92xxy0xuch85h8sww00wq30yeth6dhs: 40,
    inj1cu3u6qx9xa9yvwq0taz5n5azr7jssguf7y6nuy: 40,
    inj13vx75cpsmvm7hxhzdnykr3vraq5s2gme2g3tna: 40,
    inj163072g64wsn8a9n2mydwlx7c0aqt4l7pjseeuu: 32,
    inj1mk8vd3rv4fy66sndm5dq36ywlaruev5aedpstc: 16,
    inj1th8f64ut0lksc6qz8epek34ax2jk2eqlurjp7z: 16,
    inj137teqqm9l7fevja9v5d7n6ljz7y2llc0d0t3aw: 8,
    inj1d50jcfga0e8kaxrhgc7mgfdm5cwraxv6c8rycn: 8
  }
}

// Rule: always put the latest campaign name first so Modals/CompetitionWinner/Index.vue works properly
export const PAST_LEADERBOARD_CAMPAIGN_NAMES = [FIRST_CAMPAIGN_NAME]

export const CAMPAIGN_WINNER_MESSAGE =
  'Signing this transaction verifies ownership of this wallet and will not incur any gas fees.'
