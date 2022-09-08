const {
  IS_TESTNET,
  IS_MAINNET_STAGING,
  IS_DEVNET
} = require('./app/utils/constants')

const mainnetSpot = [
  'inj-usdt',
  'dot-usdt',
  'atom-usdt',
  'usdc-usdt',
  'xprt-usdt',
  'weth-usdt',
  'evmos-usdt',
  'ape-usdt',
  'link-usdt',
  'gf-usdt'
]
const testnetSpot = [...mainnetSpot]
const mainnetStagingSpot = [...mainnetSpot, 'strd-usdt']
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

const binaryOptions = ['']
const expiryFutures = ['']
const futures = [...perpetuals, ...expiryFutures]

if (IS_DEVNET || IS_MAINNET_STAGING) {
  //
}

const spotRoutes = spot.map((s) => `/spot/${s}`) || []
const futuresRoutes = futures.map((s) => `/futures/${s}`) || []
const binaryOptionsRoutes =
  binaryOptions.map((s) => `/binary-options/${s}`) || []

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
  '/convert',
  ...upcomingMarketsRoutes,
  ...deprecatedMarketsRoutes,
  ...spotRoutes,
  ...futuresRoutes,
  ...binaryOptionsRoutes
]

module.exports.spot = spot
module.exports.binaryOptions = binaryOptions
module.exports.expiryFutures = expiryFutures
module.exports.perpetuals = perpetuals
module.exports.futures = futures
module.exports.upcomingMarketsRoutes = upcomingMarketsRoutes
