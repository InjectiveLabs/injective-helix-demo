import { getExactDecimalsFromNumber } from './helpers'
import { DOMEvent } from '~/types'

export const isNumericKeycode = (keyCode?: number) =>
  keyCode &&
  ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))

export const convertToNumericValue = (value: string) => {
  if (value === '') {
    return value
  }

  if (value.startsWith('0.0')) {
    return value
  }

  // Number function cuts off at 18 digits
  if (value.includes('.')) {
    const [wholeValue, decimalValue] = value.split('.')

    return `${Number(wholeValue)}.${decimalValue}`
  }

  return Number(value)
}

export const passNumericInputValidation = (
  event: DOMEvent<HTMLInputElement>,
  additionalInvalidChars: string[] = []
): boolean => {
  if (!event.key) {
    return true
  }

  const invalidChars = ['-', '+', 'e']

  return ![...invalidChars, ...additionalInvalidChars].includes(event.key)
}

export const hasLessThenLimitedDecimalPlaces = (
  value: string,
  limitedDecimalPlaces: number | undefined
): boolean => {
  const valueDecimalPlaces = getExactDecimalsFromNumber(value)

  return (
    !limitedDecimalPlaces ||
    valueDecimalPlaces < limitedDecimalPlaces ||
    limitedDecimalPlaces === 0
  )
}

export const integerContainsDot = (
  key: string,
  limitedDecimalPlaces: number | undefined
): boolean => {
  return limitedDecimalPlaces === 0 && key === '.'
}

export const inputTextIsHighlighted = (
  event: DOMEvent<HTMLInputElement>
): boolean => {
  if (!event.view) {
    return false
  }

  const highlightedText = event.view.getSelection().toString()

  return highlightedText.trim() !== ''
}

export const passDecimalPlaceValidation = (
  event: DOMEvent<HTMLInputElement>,
  decimalPlaces: number | undefined
) => {
  if (!event || !event.keyCode || !event.key) {
    return true
  }

  return (
    !integerContainsDot(event.key, decimalPlaces) &&
    (!isNumericKeycode(event.keyCode) ||
      hasLessThenLimitedDecimalPlaces(event.target.value, decimalPlaces))
  )
}
