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

const derivatives = ['inj-usdt-perp', 'btc-usd-0625']

module.exports = [
  ...spot.map((s) => `/spot/${s}`),
  ...derivatives.map((d) => `/derivatives/${d}`)
]
