const spot = [
  'inj-usdt',
  'inj-usdc',
  'bnb-usdt',
  'bnb-usdc',
  'atom-usdt',
  'wbtc-usdc',
  'wbtc-usdt',
  'weth-usdt',
  'weth-usdc',
  'usdt-usdc',
  'usdc-usdt',
  'link-usdt',
  'link-usdc',
  'aave-usdt',
  'aave-usdc',
  'matic-usdt',
  'matic-usdc',
  'sushi-usdt',
  'sushi-usdc',
  'grt-usdt',
  'axs-usdt',
  'grt-usdc',
  'uni-usdt',
  'uni-usdc',
  'snx-usdt',
  'qnt-usdt',
  'yfi-usdt',
  'snx-usdt',
  'axs-usdt',
  'zrx-usdt'
]

const derivatives = [
  'inj-usdt-perp',
  'inj-usdt',
  'bnb-usdt-perp',
  'bnb-usdt',
  'btc-usdt-perp',
  'btc-usdt',
  'btc-usdc-perp',
  'btc-usdc',
  'eth-usdt-perp',
  'eth-usdt-perp-band',
  'eth-usdt',
  'link-usdt-perp',
  'link-usdt',
  'comp-usdt-perp',
  'comp-usdt',
  'uni-usdt-perp',
  'uni-usdt',
  'grt-usdt-perp',
  'grt-usdt',
  'snx-usdt-perp',
  'snx-usdt',
  'bat-usdt-perp',
  'bat-usdt'
]

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
