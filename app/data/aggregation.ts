export interface CustomAggregation {
  minTick?: string
  maxTick: string
  default?: string
}

export const aggregationList = [
  {
    value: '-2',
    text: '100'
  },
  {
    value: '-1',
    text: '10'
  },
  {
    value: '0',
    text: '1'
  },
  {
    value: '1',
    text: '0.1'
  },
  {
    value: '2',
    text: '0.01'
  },
  {
    value: '3',
    text: '0.001'
  },
  {
    value: '4',
    text: '0.0001'
  },
  {
    value: '5',
    text: '0.00001'
  },
  {
    value: '6',
    text: '0.000001'
  }
]

export const getDecimalPlaceFromValue = (value: string) =>
  aggregationList.find(({ text }) => text === value)?.value

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
    minTick: getDecimalPlaceFromValue('0.01'),
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
    minTick: getDecimalPlaceFromValue('0.01'),
    default: getDecimalPlaceFromValue('0.01'),
    maxTick: getDecimalPlaceFromValue('10')
  }
} as Record<string, CustomAggregation>
