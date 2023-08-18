import { defineNuxtPlugin } from '#app'
import {
  email,
  min,
  max,
  between,
  min_value as minValue
} from '@vee-validate/rules'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { NUMBER_REGEX } from '@injectivelabs/sdk-ui-ts'
import { defineRule } from 'vee-validate'
import { BigNumberInBase } from '@injectivelabs/utils'
import { defineTradeRules } from '@/app/client/utils/validation/trade'

const formatFieldName = (value: string) => value.replace(/[^a-z]+/gi, '')

export const errorMessages = {
  injAddress: () => 'This field is not a valid Injective address',
  positiveNumber: () => 'This field is not a valid number',
  integer: (fieldName: string) => `${fieldName} must be > 0`,
  between: (_field: string, params: Record<string, any>) =>
    `${
      params.max <= params.min
        ? `Your input value of ${params._value_} cant be higher than ${params.max}`
        : `This field should be between ${params.min} and ${params.max}`
    }`
} as Record<string, (_field?: string, _params?: Record<string, any>) => string>

export const defineGlobalRules = () => {
  defineRule('email', email)
  defineRule('between', between)
  defineRule('min', min)
  defineRule('max', max)
  defineRule('minValue', minValue)

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
