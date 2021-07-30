const spot = [
  'inj-usdt',
  'inj-usdc',
  'weth-usdt',
  'weth-usdc',
  'usdt-usdc',
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
  'qnt-usdt'
]

const derivatives = ['inj-usdt-perp']

module.exports = [
  ...spot.map((s) => `/spot/${s}`),
  ...derivatives.map((d) => `/derivatives/${d}`)
]

module.exports.spot = spot
module.exports.derivatives = derivatives
