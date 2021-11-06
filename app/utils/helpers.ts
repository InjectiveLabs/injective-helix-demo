import { BigNumber } from '@injectivelabs/utils'

export const getSignificantDecimalsFromNumber = (
  number: number | string
): number => {
  if (Math.floor(new BigNumber(number).toNumber()) === number) {
    return 0
  }

  const decimals = number.toString().split('.')[1]

  if (!decimals.length) {
    return 0
  }

  return decimals.replace('0', '').length || 0
}

export const getDecimalsFromNumber = (number: number | string): number => {
  const numberToBn = new BigNumber(number).toNumber()
  const numberParts = numberToBn.toString().split('.')
  const [, decimals] = numberParts

  return decimals ? decimals.length : 1
}
