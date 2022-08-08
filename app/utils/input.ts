import { DOMEvent } from '~/types'

export const isNumericKeycode = (keyCode?: number) =>
  keyCode &&
  ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))

export const convertToNumericValue = (value: string, maxDecimals: number) => {
  if (value === '') {
    return value
  }

  const numericValue = `${parseFloat(value.replace(/[^.\d]/g, ''))}`

  if (numericValue.includes('.')) {
    const [wholeValue, decimalValue] = numericValue.split('.')

    const formattedDecimalValue =
      decimalValue.length > maxDecimals
        ? decimalValue.substring(0, maxDecimals)
        : decimalValue

    return `${Number(wholeValue)}.${formattedDecimalValue}`
  }

  return Number(numericValue)
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

export const inputTextIsHighlighted = (
  event: DOMEvent<HTMLInputElement>
): boolean => {
  if (!event.view) {
    return false
  }

  const highlightedText = event.view.getSelection().toString()

  return highlightedText.trim() !== ''
}
