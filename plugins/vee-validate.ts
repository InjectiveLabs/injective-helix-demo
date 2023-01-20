import { defineNuxtPlugin } from '#app'
import { email, min, max, between } from '@vee-validate/rules'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { NUMBER_REGEX } from '@injectivelabs/sdk-ui-ts'
import { defineRule } from 'vee-validate'
import { defineTradeRules } from '@/app/client/utils/validation/trade'

// eslint-disable-next-line prefer-regex-literals
const REFER_CODE_REGEX = new RegExp(/^[A-Z]([A-Z0-9]{7})$/)
const formatFieldName = (value: string) => value.replace(/[^a-z]+/gi, '')

export const errorMessages = {
  referralCode: () => 'This is not a valid refer code',
  injAddress: () => 'This field is not a valid Injective address',
  required: () => 'This field is required',
  positiveNumber: () => 'This field is not a valid number',
  email: () => 'This field is not a valid email',
  max: () => 'This field should be less than {length}',
  min: () => 'This field should be greater than {length}',
  between: (_field: string, params: Record<string, any>) =>
    `${
      params.max <= params.min
        ? `Your input value of ${params._value_} cant be higher than ${params.max}`
        : `This field should be between ${params.min} and ${params.max}`
    }`
} as Record<string, any>

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

  defineRule('referralCode', (value: string) => {
    if (REFER_CODE_REGEX.test(value)) {
      return true
    }

    return errorMessages.referralCode()
  })

  defineRule('positiveNumber', (value: string) => {
    if (NUMBER_REGEX.test(value)) {
      return true
    }

    return errorMessages.positiveNumber()
  })
}

export default defineNuxtPlugin(() => {
  defineGlobalRules()
  defineTradeRules()
})
