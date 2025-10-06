import type { KeydownEvent } from './../types'

const MAXIMUM_ALLOWED_VALUE = 10 ** 18

const formatDecimalPlacesByLimit = (value: string, maxDecimals: number) => {
  return value.length > maxDecimals ? value.substring(0, maxDecimals) : value
}

export const stripNonDigits = (value: string) => {
  return parseFloat(value.replace(/[^.\d]/g, ''))
}

export const convertToNumericValue = (value: string, maxDecimals: number) => {
  if (value === '') {
    return value
  }

  if (value.startsWith('.')) {
    value = `0${value}`
  }

  const [wholeValue, decimalValue] = value.split('.')

  const formattedWholeNumber = parseFloat(wholeValue)

  if (formattedWholeNumber > MAXIMUM_ALLOWED_VALUE) {
    return 0
  }

  if (decimalValue) {
    return `${formattedWholeNumber}.${formatDecimalPlacesByLimit(
      decimalValue,
      maxDecimals
    )}`
  }

  return formattedWholeNumber
}

export const validateNumericInput = (
  event: KeydownEvent<HTMLInputElement>,
  additionalInvalidChars: string[] = []
): boolean => {
  if (!event.key) {
    return true
  }

  const isControlKey = event.ctrlKey || event.metaKey
  const isCut = isControlKey && event.key.toLowerCase() === 'x'
  const isCopy = isControlKey && event.key.toLowerCase() === 'c'
  const isPaste = isControlKey && event.key.toLowerCase() === 'v'
  const isRefresh = isControlKey && event.key.toLowerCase() === 'r'

  if (isCut || isCopy || isPaste || isRefresh) {
    return true
  }

  const allowedEventKeys = [
    '.',
    'Tab',
    'Enter',
    'Delete',
    'Escape',
    'Backspace',
    'ArrowLeft',
    'ArrowRight'
  ]

  if (!allowedEventKeys.includes(event.key) && !isFinite(Number(event.key))) {
    return false
  }

  const invalidChars = ['-', '+', 'e']

  return ![...invalidChars, ...additionalInvalidChars].includes(event.key)
}

export const passNumericInputValidation = (
  event: KeydownEvent<HTMLInputElement>,
  additionalInvalidChars: string[] = []
): boolean => {
  if (!event.key) {
    return true
  }

  const invalidChars = ['-', '+', 'e']

  return ![...invalidChars, ...additionalInvalidChars].includes(event.key)
}
