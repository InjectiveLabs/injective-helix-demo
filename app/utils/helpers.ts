export const getSignificantDecimalsFromNumber = (number: number): number => {
  if (Math.floor(number) === number) {
    return 0
  }

  const decimals = number.toString().split('.')[1]

  if (!decimals.length) {
    return 0
  }

  return decimals.replace('0', '').length || 0
}
