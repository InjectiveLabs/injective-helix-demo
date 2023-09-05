import { defineNuxtPlugin } from '#app'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { NUMBER_REGEX } from '@injectivelabs/sdk-ui-ts'
import { defineRule } from 'vee-validate'
import { BigNumberInBase } from '@injectivelabs/utils'
import { defineTradeRules } from '@/app/client/utils/validation/trade'

const formatFieldName = (value: string) => value.replace(/[^a-z]+/gi, '')

export const errorMessages = {
  email: () => 'This field should be a valid email',
  injAddress: () => 'This field is not a valid Injective address',
  positiveNumber: () => 'This field is not a valid number',
  integer: (fieldName: string) => `${fieldName} must be > 0`
} as Record<string, (_field?: string, _params?: Record<string, any>) => string>

export const defineGlobalRules = () => {
  defineRule('email', (value: string) => {
    const validEmailPattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!validEmailPattern.test(String(value))) {
      return errorMessages.email()
    }

    return true
  })

  defineRule('between', (value: string, [min, max]: string[]) => {
    const valueIsOutOfBounds =
      Number(min) > Number(value) || Number(max) < Number(value)

    if (valueIsOutOfBounds) {
      return `${
        max <= min
          ? `Your input value of ${value} cannot be higher than ${max}`
          : `This field should be between ${min} and ${max}`
      }`
    }

    return true
  })

  defineRule('minValue', (value: string, [min]: string[]) => {
    if (Number(value) < Number(min)) {
      return `This field should be greater than ${min}`
    }

    return true
  })

  defineRule(
    'required',
    (value: string | number, _, { field }: { field: string }) => {
      if (!value || !value.toString().length || Number(value) === 0) {
        if (field.toLowerCase().includes('amount')) {
          return 'amount is required'
        }

        return `${formatFieldName(field)} is required.`
      }

      return true
    }
  )

  defineRule('injAddress', (value: string) => {
    try {
      getEthereumAddress(value)

      return true
    } catch (error: any) {
      return errorMessages.injAddress()
    }
  })

  defineRule('positiveNumber', (value: string) => {
    if (NUMBER_REGEX.test(value)) {
      return true
    }

    return errorMessages.positiveNumber()
  })

  defineRule('positiveNumber', (value: string) => {
    if (NUMBER_REGEX.test(value)) {
      return true
    }

    return errorMessages.positiveNumber()
  })

  defineRule('integer', (value: string, [fieldName]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value || 0)

    if (valueInBigNumber.lte(0)) {
      return errorMessages.integer(fieldName)
    }

    return true
  })

  defineRule('betweenSgt', (value: string, [min, max]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)
    const minInBigNumber = new BigNumberInBase(min)
    const maxInBigNumber = new BigNumberInBase(max)

    const isBetween =
      valueInBigNumber.lte(maxInBigNumber) &&
      valueInBigNumber.gte(minInBigNumber)

    if (!isBetween) {
      return `Value must be between: ${min} and ${max}`
    }

    return true
  })

  defineRule('requiredSgt', (value: string) => {
    if (!value) {
      return 'Field is required'
    }

    return true
  })

  defineRule('minValueSgt', (value: string, [min]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.lt(min)) {
      return `Minimum amount should be ${min}`
    }

    return true
  })

  defineRule('greaterThanSgt', (value: string, [min]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.lte(min)) {
      return `Value should be greater than ${min}`
    }

    return true
  })

  defineRule('lessThanSgt', (value: string, [max]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.gte(max)) {
      return `Value should be less than ${max}`
    }

    return true
  })

  defineRule('minInvestmentSgt', (value: string, [min]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.lt(min)) {
      return `Minimum USDT investment required to run this grid strategy is ${min}`
    }

    return true
  })

  defineRule('insufficientSgt', (value: string, [max]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.gt(max)) {
      return `Insufficient Amount`
    }

    return true
  })
}

export default defineNuxtPlugin(() => {
  defineGlobalRules()
  defineTradeRules()
})
