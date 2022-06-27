const {
  IS_TESTNET,
  IS_MAINNET_STAGING,
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

const mainnetPerpetuals = [
  'btc-usdt-perp',
  'inj-usdt-perp',
  'eth-usdt-perp',
  'osmo-usdt-perp',
  'bayc-weth-perp',
  'bnb-usdt-perp',
  'stx-usdt-perp',
  'atom-usdt-perp'
]
const testnetPerpetuals = [...mainnetPerpetuals]
const mainnetStagingPerpetuals = [...mainnetPerpetuals]
const perpetuals = IS_TESTNET
  ? testnetPerpetuals
  : IS_MAINNET_STAGING
  ? mainnetStagingPerpetuals
  : mainnetPerpetuals

const expiryFutures = ['']

const spotRoutes = spot.map((s) => `/spot/${s}`) || []
const perpetualsRoutes = perpetuals.map((s) => `/perpetuals/${s}`) || []
const derivativesRoutes = perpetuals.map((s) => `/derivatives/${s}`) || [] // Legacy support

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
  ...perpetualsRoutes,
  ...derivativesRoutes
]

module.exports.spot = spot
module.exports.derivatives = perpetuals /* Legacy support */
module.exports.perpetuals = perpetuals
module.exports.expiryFutures = expiryFutures
module.exports.upcomingMarketsRoutes = upcomingMarketsRoutes
