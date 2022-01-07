const { IS_TESTNET, IS_MAINNET_STAGING } = require('./app/utils/constants')

const testnetSpot = [
  'inj-usdt',
  'atom-usdt',
  'weth-usdt',
  'link-usdt',
  'link-usdc',
  'ust-usdt',
  'luna-ust',
  'axs-usdt',
  'inj-usdc',
  'bnb-usdt',
  'bnb-usdc',
  'wbtc-usdc',
  'wbtc-usdt',
  'usdt-usdc',
  'usdc-usdt',
  'weth-usdc',
  'aave-usdt',
  'aave-usdc',
  'matic-usdt',
  'matic-usdc',
  'sushi-usdt',
  'sushi-usdc',
  'grt-usdt',
  'grt-usdc',
  'uni-usdt',
  'uni-usdc',
  'snx-usdt',
  'qnt-usdt',
  'yfi-usdt',
  'snx-usdt',
  'zrx-usdt'
]
const mainnetSpot = [
  'inj-usdt',
  'atom-usdt',
  'weth-usdt',
  'link-usdt',
  'ust-usdt',
  'luna-ust',
  'gf-usdt'
]
const mainnetStagingSpot = [...mainnetSpot]
const spot = IS_TESTNET
  ? testnetSpot
  : IS_MAINNET_STAGING
  ? mainnetStagingSpot
  : mainnetSpot

const testnetDerivatives = [
  'btc-usdt-perp',
  'eth-usdt-perp',
  'bnb-usdt-perp',
  'inj-usdt-perp',
  'luna-ust-perp',
  'eth-usdt-perp-band',
  'link-usdt-perp',
  'comp-usdt-perp',
  'uni-usdt-perp',
  'grt-usdt-perp',
  'snx-usdt-perp',
  'bat-usdt-perp',
  'comp-usdt',
  'link-usdt',
  'uni-usdt',
  'grt-usdt',
  'snx-usdt'
]
const mainnetDerivatives = [
  'btc-usdt-perp',
  'eth-usdt-perp',
  'luna-ust-perp',
  'bnb-usdt-perp'
]
const mainnetStagingDerivatives = [...mainnetDerivatives, 'inj-usdt-perp']
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
  '/dmm',
  '/faq',
  ...spot.map((s) => `/spot/${s}`),
  ...derivatives.map((d) => `/derivatives/${d}`)
]

module.exports.spot = spot
module.exports.derivatives = derivatives
