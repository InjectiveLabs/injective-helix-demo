import { defineNuxtPlugin } from '#app'
import { email, min, max, between } from '@vee-validate/rules'
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
} as Record<string, (field?: string, params?: Record<string, any>) => string>

export const defineGlobalRules = () => {
  defineRule('email', email)
  defineRule('between', between)
  defineRule('min', min)
  defineRule('max', max)

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
}

export default defineNuxtPlugin(() => {
  defineGlobalRules()
  defineTradeRules()
})
