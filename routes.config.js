const spot = [
  'inj-usdt',
  'matic-usdt',
  'bnb-usdt',
  'link-usdt',
  'uni-usdt',
  'yfi-usdt',
  'aave-usdt',
  'zrx-usdt'
]

const derivatives = [
  'btc-usdt',
  'eth-usdt',
  'link-usdt',
  'grt-usdt',
  'uni-usdt',
  'comp-usdt',
  'snx-usdt'
]

module.exports = [
  ...spot.map((s) => `/spot/${s}`),
  ...derivatives.map((d) => `/derivatives/${d}`)
]
