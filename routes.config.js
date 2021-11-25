const { IS_TESTNET } = require('./app/utils/constants')

const testnetSpot = [
  'inj-usdt',
  'atom-usdt',
  'weth-usdt',
  'link-usdt',
  'link-usdc',
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
  'axs-usdt'
]
const spot = IS_TESTNET ? testnetSpot : mainnetSpot

const testnetDerivatives = [
  'btc-usdt-perp',
  'eth-usdt-perp',
  'bnb-usdt-perp',
  'inj-usdt-perp',
  'eth-usdt-perp-band',
  'link-usdt-perp',
  'comp-usdt-perp',
  'uni-usdt-perp',
  'grt-usdt-perp',
  'snx-usdt-perp',
  'bat-usdt-perp'
]
const mainnetDerivatives = ['btc-usdt-perp', 'eth-usdt-perp', 'bnb-usdt-perp']
const derivatives = IS_TESTNET ? testnetDerivatives : mainnetDerivatives

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
