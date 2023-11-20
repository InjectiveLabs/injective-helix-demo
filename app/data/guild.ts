import { IS_TESTNET } from 'app/utils/constants'
import { Epoch } from 'types'

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
  bd5082: 'The Quants > Premier Berbs',
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
    campaignId: 'spot-grid-inj-usdt',
    startDate: 1697295600,
    endDate: 1699974000,
    baseRewards: '1000',
    quoteRewards: '10000',
    scAddress: 'inj1tze0el9kvnw06mha3gty6fqcmn2t7efqpzz6pj'
  }
]

export const LP_EPOCHS = IS_TESTNET ? testnetEpochs : mainnetEpochs
