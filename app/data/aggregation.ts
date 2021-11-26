export interface CustomAggregation {
  maxTick: string
  default: string
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
  }
]

const getDecimalPlaceFromValue = (value: string) =>
  aggregationList.find(({ text }) => text === value)?.value

export const customAggregations = {
  'BNB/USDT': {
    maxTick: getDecimalPlaceFromValue('10'),
    default: getDecimalPlaceFromValue('0.1')
  },
  'BNB/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('10'),
    default: getDecimalPlaceFromValue('0.1')
  },
  'BTC/USDT': {
    maxTick: getDecimalPlaceFromValue('100'),
    default: getDecimalPlaceFromValue('10')
  },
  'BTC/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('100'),
    default: getDecimalPlaceFromValue('10')
  },
  'ETH/USDT': {
    maxTick: getDecimalPlaceFromValue('10'),
    default: getDecimalPlaceFromValue('1')
  },
  'ETH/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('10'),
    default: getDecimalPlaceFromValue('1')
  },
  'WETH/USDT': {
    maxTick: getDecimalPlaceFromValue('10'),
    default: getDecimalPlaceFromValue('1')
  },
  'WETH/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('10'),
    default: getDecimalPlaceFromValue('1')
  }
} as Record<string, CustomAggregation>
