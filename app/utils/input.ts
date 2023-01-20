import { formatNumberToAllowableTensMultiplier } from '@injectivelabs/sdk-ts'
import { DOMEvent } from '@/types'

export const isNumericKeycode = (keyCode?: number) =>
  keyCode &&
  ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))

export const convertToNumericValue = ({
  value,
  maxDecimals,
  tensMultiplier
}: {
  value: string
  maxDecimals: number
  tensMultiplier?: number
}) => {
  if (value === '') {
    return value
  }

  if (value.includes('.')) {
    const [wholeValue, decimalValue] = value.split('.')

    if (maxDecimals <= 0 && tensMultiplier) {
      return `${Number(
        formatNumberToAllowableTensMultiplier(value, tensMultiplier || 0)
      )}`
    }

    const formattedDecimalValue =
      decimalValue.length > maxDecimals
        ? decimalValue.substring(0, maxDecimals)
        : decimalValue

    return `${Number(wholeValue)}.${formattedDecimalValue}`
  }

  if (tensMultiplier) {
    return `${Number(
      formatNumberToAllowableTensMultiplier(value, tensMultiplier || 0)
    )}`
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

export const inputTextIsHighlighted = (
  event: DOMEvent<HTMLInputElement>
): boolean => {
  if (!event.view) {
    return false
  }

  const highlightedText = event.view.getSelection().toString()

  return highlightedText.trim() !== ''
}
