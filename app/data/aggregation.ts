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
  'BNB/USDT': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'BNB/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'LUNA/UST': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'LUNA/UST PERP': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'BTC/USDT': {
    maxTick: getDecimalPlaceFromValue('100')
  },
  'BTC/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('100')
  },
  'ETH/USDT': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'ETH/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'WETH/USDT': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'WETH/USDT PERP': {
    maxTick: getDecimalPlaceFromValue('10')
  },
  'HUAHUA/USDT': {
    minTick: getDecimalPlaceFromValue('0.000001'),
    maxTick: getDecimalPlaceFromValue('0.0001'),
    default: getDecimalPlaceFromValue('0.000001')
  }
} as Record<string, CustomAggregation>
