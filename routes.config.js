const { Network } = require('@injectivelabs/networks')
const {
  IS_TESTNET,
  IS_MAINNET_STAGING,
  NETWORK
} = require('./app/utils/constants')

const mainnetSpot = [
  'inj-usdt',
  'huahua-usdt',
  'evmos-usdt',
  'ape-usdt',
  'atom-usdt',
  'weth-usdt',
  'huahua-usdt',
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
  'bayc-weth-perp',
  'luna-ust-perp',
  'bnb-usdt-perp',
  'atom-usdt-perp',
  'osmo-usdt-perp'
]
const testnetDerivatives = [...mainnetDerivatives]
const mainnetStagingDerivatives = [...mainnetDerivatives]
const derivatives = IS_TESTNET
  ? testnetDerivatives
  : IS_MAINNET_STAGING
  ? mainnetStagingDerivatives
  : mainnetDerivatives

if (NETWORK === Network.Devnet || IS_MAINNET_STAGING) {
  derivatives.push('stx-usdt-perp')
  spot.push('xprt-usdt')
}

const spotRoutes = spot.map((s) => `/spot/${s}`) || []
const derivativesRoutes = derivatives.map((s) => `/derivatives/${s}`) || []
const upcomingMarketsRoutes = ['/market', '/market/ape-usdt']

module.exports = [
  '/',
  '/portfolio',
  '/activity',
  '/fee-discounts',
  '/trade-and-earn',
  '/faq',
  '/markets',
  '/register',
  '/trade-and-earn',
  ...upcomingMarketsRoutes,
  ...spotRoutes,
  ...derivativesRoutes
]

module.exports.spot = spot
module.exports.derivatives = derivatives
module.exports.upcomingMarketsRoutes = upcomingMarketsRoutes
