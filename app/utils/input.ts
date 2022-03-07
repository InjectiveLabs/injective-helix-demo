import { getExactDecimalsFromNumber } from './helpers'
import { DOMEvent } from '~/types'

export const isNumericKeycode = (keyCode?: number) =>
  keyCode &&
  ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))

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
  limitedDecimalPlaces: number
): boolean => {
  const valueDecimalPlaces = getExactDecimalsFromNumber(value)

  return valueDecimalPlaces < limitedDecimalPlaces
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

export const hasMoreThenDpAndKeyCodeIsNumeric = ({
  value,
  decimalPlaces,
  event
}: {
  value: string
  decimalPlaces: number
  event: DOMEvent<HTMLInputElement>
}) => {
  if (!event || !event.keyCode || !event.key) {
    return true
  }

  return (
    !inputTextIsHighlighted(event) &&
    !hasLessThenLimitedDecimalPlaces(value, decimalPlaces) &&
    isNumericKeycode(event.keyCode)
  )
}
