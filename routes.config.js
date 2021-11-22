const { IS_TESTNET } = require('./app/utils/constants')

const testnetSpot = IS_TESTNET
  ? [
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
  : []
const mainnetSpot = [
  'inj-usdt',
  'atom-usdt',
  'weth-usdt',
  'link-usdt',
  'link-usdc',
  'axs-usdt'
]
const spot = [...mainnetSpot, ...testnetSpot]

const testnetDerivatives = IS_TESTNET
  ? [
      'inj-usdt-perp',
      'eth-usdt-perp',
      'bnb-usdt-perp',
      'eth-usdt-perp-band',
      'link-usdt-perp',
      'comp-usdt-perp',
      'uni-usdt-perp',
      'grt-usdt-perp',
      'snx-usdt-perp',
      'bat-usdt-perp'
    ]
  : []
const mainnetDerivatives = ['btc-usdt-perp']
const derivatives = [...mainnetDerivatives, ...testnetDerivatives]

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
