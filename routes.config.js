const { Network } = require('@injectivelabs/networks')
const {
  IS_TESTNET,
  IS_MAINNET_STAGING,
  NETWORK,
  IS_DEVNET
} = require('./app/utils/constants')

const mainnetSpot = [
  'inj-usdt',
  'dot-usdt',
  'atom-usdt',
  'xprt-usdt',
  'weth-usdt',
  'evmos-usdt',
  'ape-usdt',
  'link-usdt',
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
  'osmo-usdt-perp',
  'bayc-weth-perp',
  'bnb-usdt-perp',
  'stx-usdt-perp',
  'atom-usdt-perp'
]
const testnetDerivatives = [...mainnetDerivatives]
const mainnetStagingDerivatives = [...mainnetDerivatives]
const derivatives = IS_TESTNET
  ? testnetDerivatives
  : IS_MAINNET_STAGING
  ? mainnetStagingDerivatives
  : mainnetDerivatives

if (NETWORK === Network.Devnet || IS_MAINNET_STAGING) {
  // derivatives.push()
  // spot.push('dot-usdt')
}

const spotRoutes = spot.map((s) => `/spot/${s}`) || []
const derivativesRoutes = derivatives.map((s) => `/derivatives/${s}`) || [] // example: '/market/huahua-usdt'

const upcomingMarketsRoutes = []
const deprecatedMarketsRoutes = IS_TESTNET || IS_DEVNET ? [] : []

module.exports = [
  '/',
  '/portfolio',
  '/activity',
  '/fee-discounts',
  '/trade-and-earn',
  '/faq',
  '/markets',
  '/market',
  '/register',
  '/trade-and-earn',
  ...upcomingMarketsRoutes,
  ...deprecatedMarketsRoutes,
  ...spotRoutes,
  ...derivativesRoutes
]

module.exports.spot = spot
module.exports.derivatives = derivatives
module.exports.upcomingMarketsRoutes = upcomingMarketsRoutes
