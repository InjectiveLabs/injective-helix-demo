export interface CustomAggregation {
  start: string
  end: string
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
    start: getDecimalPlaceFromValue('10'),
    end: getDecimalPlaceFromValue('0.1'),
    default: getDecimalPlaceFromValue('0.1')
  },
  'BNB/USDT PERP': {
    start: getDecimalPlaceFromValue('10'),
    end: getDecimalPlaceFromValue('0.1'),
    default: getDecimalPlaceFromValue('0.1')
  },
  'BTC/USDT': {
    start: getDecimalPlaceFromValue('100'),
    end: getDecimalPlaceFromValue('0.1'),
    default: getDecimalPlaceFromValue('10')
  },
  'BTC/USDT PERP': {
    start: getDecimalPlaceFromValue('100'),
    end: getDecimalPlaceFromValue('0.1'),
    default: getDecimalPlaceFromValue('10')
  },
  'WETH/USDT': {
    start: getDecimalPlaceFromValue('10'),
    end: getDecimalPlaceFromValue('0.1'),
    default: getDecimalPlaceFromValue('1')
  },
  'WETH/USDT PERP': {
    start: getDecimalPlaceFromValue('10'),
    end: getDecimalPlaceFromValue('0.1'),
    default: getDecimalPlaceFromValue('1')
  }
} as Record<string, CustomAggregation>
