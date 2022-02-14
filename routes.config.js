const { IS_TESTNET, IS_MAINNET_STAGING } = require('./app/utils/constants')

const mainnetSpot = [
  'inj-usdt',
  'huahua-usdt',
  'atom-usdt',
  'weth-usdt',
  'link-usdt',
  'ust-usdt',
  'luna-ust',
  'gf-usdt'
]
const testnetSpot = [...mainnetSpot]
const mainnetStagingSpot = [...mainnetSpot]
const spot = IS_TESTNET
  ? testnetSpot
  : IS_MAINNET_STAGING
  ? mainnetStagingSpot
  : mainnetSpot

const mainnetDerivatives = [
  'btc-usdt-perp',
  'inj-usdt-perp',
  'eth-usdt-perp',
  'luna-ust-perp',
  'bnb-usdt-perp',
  'atom-usdt-perp'
]
const testnetDerivatives = [...mainnetDerivatives, 'bayc-weth-perp']
const mainnetStagingDerivatives = [...mainnetDerivatives]
const derivatives = IS_TESTNET
  ? testnetDerivatives
  : IS_MAINNET_STAGING
  ? mainnetStagingDerivatives
  : mainnetDerivatives

module.exports = [
  '/',
  '/portfolio',
  '/wallet',
  '/history',
  '/fee-discounts',
  '/trade-and-earn',
  '/faq',
  ...spot.map((s) => `/spot/${s}`),
  ...derivatives.map((d) => `/derivatives/${d}`)
]

module.exports.spot = spot
module.exports.derivatives = derivatives
