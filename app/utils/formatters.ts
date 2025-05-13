import keccak256 from 'keccak256'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { TimeDuration } from '@/types'
import type { Coin } from '@injectivelabs/sdk-ts'
import type { SharedBalanceWithToken } from '@shared/types'

BigNumber.config({
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
  }
})

export function formatAmount(
  amount: BigNumberInBase,
  displayDecimals: number
): string {
  return amount.toFormat(displayDecimals || 1, BigNumber.ROUND_DOWN)
}

export function formatPrice(
  amount: BigNumberInBase,
  displayDecimals: number
): string {
  return amount.toFormat(displayDecimals || 1, BigNumber.ROUND_HALF_UP)
}

export function formatPriceUp(
  amount: BigNumberInBase,
  displayDecimals: number
): string {
  return amount.toFormat(displayDecimals || 1, BigNumber.ROUND_UP)
}

export function formatPriceDown(
  amount: BigNumberInBase,
  displayDecimals: number
): string {
  return amount.toFormat(displayDecimals || 1, BigNumber.ROUND_DOWN)
}

export function formatPrecision(amount: BigNumber, precision: number): string {
  return amount.toFormat(precision, BigNumber.ROUND_DOWN)
}

export function formatPercent({
  number,
  precision = 0,
  appendPlusSign = false
}: {
  number: any
  precision: number
  appendPlusSign: boolean
}): string {
  const numberInBigNumber =
    number instanceof BigNumber ? number : new BigNumber(number)
  const prefix = appendPlusSign && numberInBigNumber.isGreaterThan(0) ? '+' : ''
  const suffix = '%'

  return `${prefix}${String(numberInBigNumber.toFixed(precision))}${suffix}`
}

export const convertCoinToBalancesWithToken = (
  coin: Coin
): undefined | SharedBalanceWithToken => {
  const sharedTokenStore = useSharedTokenStore()

  const meta = sharedTokenStore.tokenByDenomOrSymbol(coin.denom)

  if (!meta) {
    return
  }

  return {
    token: meta,
    denom: coin.denom,
    balance: coin.amount
  }
}

export const generateUniqueHash = ({
  value,
  limit
}: {
  value: string
  limit: number
}) => {
  return keccak256(value).toString('hex').replace('0x', '').slice(0, limit)
}

export const formatSecondsToDisplay = ({
  value,
  roundUp = true
}: {
  value: number
  roundUp?: boolean
}) => {
  if (value === 0) {
    return
  }

  const output = {
    [TimeDuration.Day]: Math.floor(value / (3600 * 24)),
    [TimeDuration.Hour]: Math.floor((value % (3600 * 24)) / 3600),
    [TimeDuration.Minute]: Math.floor((value % 3600) / 60),
    [TimeDuration.Second]: Math.floor(value % 60)
  } as Record<string, number>

  if (!roundUp) {
    return output
  }

  if (output[TimeDuration.Day] === 1 && output[TimeDuration.Hour] === 0) {
    output[TimeDuration.Day] = 0
    output[TimeDuration.Hour] = 24
  }

  if (output[TimeDuration.Hour] === 1 && output.minutes === 0) {
    output[TimeDuration.Hour] = 0
    output[TimeDuration.Minute] = 60
  }

  if (output[TimeDuration.Minute] === 1 && output[TimeDuration.Second] === 0) {
    output[TimeDuration.Minute] = 0
    output[TimeDuration.Second] = 60
  }

  return output
}

export const abbreviateNumber = (value: string | number) => {
  const VALUE_TO_ABBREVIATE = 10_000_000

  const valueToBigNumber = new BigNumberInBase(value)

  if (valueToBigNumber.lte(VALUE_TO_ABBREVIATE)) {
    return undefined
  }

  const abbreviatedValue = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(valueToBigNumber.toNumber())

  return abbreviatedValue
}

export const calculateLeverage = (initialMarginRatio?: string) => {
  if (!initialMarginRatio) {
    return ZERO_IN_BASE
  }

  const leverage = new BigNumberInBase(
    new BigNumberInBase(1).dividedBy(initialMarginRatio).dp(0)
  )

  const steps = [1, 2, 3, 5, 10, 20, 25, 50, 100, 150, 200]

  const stepsLessThanMaxLeverage = steps.filter(
    (step) => step <= leverage.toNumber()
  )

  if (!stepsLessThanMaxLeverage.length) {
    return leverage
  }

  return new BigNumberInBase(
    stepsLessThanMaxLeverage[stepsLessThanMaxLeverage.length - 1]
  )
}

export const roundDustAmount = ({
  value,
  decimalPlaces
}: {
  value: string
  decimalPlaces: number
}) => {
  const valueInBase = new BigNumberInBase(value)

  if (valueInBase.gte(0.01)) {
    return valueInBase.toFormat(decimalPlaces, BigNumber.ROUND_DOWN)
  }

  const leadingZeros = value.match(/(0+\.0*)/)?.[0] || '0'
  const dustAmount = new BigNumberInBase(
    `0.${value.slice(leadingZeros.length).slice(0, decimalPlaces)}`
  )
    .toFixed(decimalPlaces)
    .replace('0.', '')

  return `${leadingZeros}${dustAmount}`
}
