import { getExactDecimalsFromNumber } from './helpers'

export const isNumericKeycode = (keyCode?: number) =>
  keyCode &&
  ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))

export const passNumericInputValidation = (
  keyCode: string,
  additionalInvalidChars: string[] = []
): boolean => {
  const invalidChars = ['-', '+', 'e']

  return ![...invalidChars, ...additionalInvalidChars].includes(keyCode)
}

export const hasLessThenLimitedDecimalPlaces = (
  value: string,
  limitedDecimalPlaces: number
) => {
  const valueDecimalPlaces = getExactDecimalsFromNumber(value)

  return valueDecimalPlaces < limitedDecimalPlaces
}

export const hasLessThenDpAndKeyCodeIsNumeric = ({
  value,
  decimalPlaces,
  keyCode
}: {
  value: string
  decimalPlaces: number
  keyCode: number
}) =>
  !hasLessThenLimitedDecimalPlaces(value, decimalPlaces) &&
  isNumericKeycode(keyCode)
