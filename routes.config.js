const spot = [
  'inj-usdt',
  'inj-usdc',
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
  'grt-usdc',
  'uni-usdt',
  'uni-usdc',
  'snx-usdt',
  'qnt-usdt',
  'yfi-usdt',
  'snx-usdt',
  'zrx-usdt'
]

const derivatives = [
  'inj-usdt-perp',
  'inj-usdt',
  'btc-usdt-perp',
  'btc-usdt',
  'eth-usdt-perp',
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
  ...spot.map((s) => `/spot/${s}`),
  ...derivatives.map((d) => `/derivatives/${d}`)
]

module.exports.spot = spot
module.exports.derivatives = derivatives
