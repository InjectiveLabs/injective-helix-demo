const {
  IS_TESTNET,
  IS_MAINNET_STAGING,
  IS_DEVNET
} = require('../app/utils/constants')

const spot = [
  'inj-usdt',
  'strd-usdt',
  'cre-usdt',
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

const perpetuals = [
  'btc-usdt-perp',
  'inj-usdt-perp',
  'eth-usdt-perp',
  'osmo-usdt-perp',
  'bnb-usdt-perp',
  'stx-usdt-perp',
  'atom-usdt-perp'
]

/** @type string[] */
const binaryOptions = []
/** @type string[] */
const expiryFutures = ['eth-usdt-19sep22']

if (IS_DEVNET) {
  spot.push('proj-usdt')
}

if (IS_TESTNET) {
  //
}

if (IS_MAINNET_STAGING) {
  //
}

if (IS_MAINNET_STAGING || IS_DEVNET) {
  //
}

const futures = [...perpetuals, ...expiryFutures]

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
  '/leaderboard',
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
