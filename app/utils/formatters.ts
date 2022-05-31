import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'

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

export const formatWalletAddress = (address: string): string => {
  if (address.length <= 10) {
    return address
  }

  return `${address.slice(0, 6)}...${address.slice(
    address.length - 6,
    address.length
  )}`
}

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

export const formatMarketIdToComplyToZeroEx = (marketId: string): string => {
  return `${marketId}00000000`
}

export const reverseFormatMarketIdToComplyToZeroEx = (
  marketId: string
): string => {
  return marketId.slice(0, marketId.length - 8)
}

export const formatToAllowableDecimals = (
  value: string | number,
  allowableDecimals: number
): string => {
  const valueAsString = typeof value === 'number' ? value.toString() : value

  const hasFractional = valueAsString.includes('.')

  if (hasFractional) {
    const fractionalLength = valueAsString.split('.')[1].length

    const fractionalGreaterThanAllowable = new BigNumberInBase(
      fractionalLength
    ).gte(allowableDecimals)

    return fractionalGreaterThanAllowable
      ? new BigNumberInBase(valueAsString).toFixed(
          allowableDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      : valueAsString
  }

  return valueAsString
}
