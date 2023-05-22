export interface CustomAggregation {
  minTick?: string
  maxTick: string
  default?: string
}

export const aggregationList = [
  {
    value: '-2',
    display: '100'
  },
  {
    value: '-1',
    display: '10'
  },
  {
    value: '0',
    display: '1'
  },
  {
    value: '1',
    display: '0.1'
  },
  {
    value: '2',
    display: '0.01'
  },
  {
    value: '3',
    display: '0.001'
  },
  {
    value: '4',
    display: '0.0001'
  },
  {
    value: '5',
    display: '0.00001'
  },
  {
    value: '6',
    display: '0.000001'
  },
  {
    value: '7',
    display: '0.0000001'
  },
  {
    value: '8',
    display: '0.00000001'
  },
  {
    value: '9',
    display: '0.000000001'
  },
  {
    value: '10',
    display: '0.0000000001'
  }
]

export const getDecimalPlaceFromValue = (value: string) =>
  aggregationList.find(({ display }) => display === value)?.value

export const customAggregations = {
  'WETH/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'INJ/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'USDT/USDC': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.01')
  },

  'LINK/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'AAVE/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'MATIC/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'UNI/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'SUSHI/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'GRT/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'INJ/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'MATIC/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'UNI/USDC': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'LINK/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'WETH/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'AAVE/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'GRT/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'SUSHI/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'SNX/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'QNT/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'WBTC/USDC': {
    minTick: getDecimalPlaceFromValue('1'),
    default: getDecimalPlaceFromValue('1'),
    maxTick: getDecimalPlaceFromValue('100')
  },

  'AXS/USDT': {
    minTick: getDecimalPlaceFromValue('0.01'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'ATOM/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'GF/USDT': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'UST/USDT': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.01')
  },

  'LUNA/UST': {
    minTick: getDecimalPlaceFromValue('0.01'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'INJ/UST': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'HUAHUA/USDT': {
    minTick: getDecimalPlaceFromValue('0.000001'),
    default: getDecimalPlaceFromValue('0.000001'),
    maxTick: getDecimalPlaceFromValue('0.0001')
  },

  'CRE/USDT': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.1')
  },

  'SOMM/USDT': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.1')
  },

  'EVMOS/USDT': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.1')
  },

  'USDC/USDT': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.1')
  },

  'XPRT/USDT': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.1')
  },

  'CANTO/USDT': {
    minTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.0001'),
    maxTick: getDecimalPlaceFromValue('0.1')
  },

  'BTC/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.1'),
    default: getDecimalPlaceFromValue('1'),
    maxTick: getDecimalPlaceFromValue('100')
  },

  'ETH/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.01'),
    default: getDecimalPlaceFromValue('0.1'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'BNB/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.01'),
    default: getDecimalPlaceFromValue('0.1'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'INJ/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('1')
  },

  'LUNA/UST PERP': {
    minTick: getDecimalPlaceFromValue('0.01'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'ATOM/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('10')
  },

  'STX/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.001'),
    default: getDecimalPlaceFromValue('0.001'),
    maxTick: getDecimalPlaceFromValue('0.1')
  },

  'BONK/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.0000000001'),
    default: getDecimalPlaceFromValue('0.000000001'),
    maxTick: getDecimalPlaceFromValue('0.000001')
  },

  '1000PEPE/USDT PERP': {
    minTick: getDecimalPlaceFromValue('0.0000001'),
    default: getDecimalPlaceFromValue('0.000001'),
    maxTick: getDecimalPlaceFromValue('0.001')
  }
} as Record<string, CustomAggregation>
