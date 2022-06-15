import { extend, localize } from 'vee-validate'
import { required, email, min, max, between } from 'vee-validate/dist/rules'
import { NUMBER_REGEX } from '@injectivelabs/sdk-ui-ts'
import { getAddressFromInjectiveAddress } from '@injectivelabs/sdk-ts'

// eslint-disable-next-line prefer-regex-literals
const REFER_CODE_REGEX = new RegExp(/^[A-Z]([A-Z0-9]{7})$/)

localize({
  en: {
    messages: {
      referralCode: 'This is not a valid refer code',
      injaddress: 'This field is not a valid Injective address',
      required: 'This field is required',
      positiveNumber: 'This field is not a valid number',
      email: 'This field should be a valid email',
      between: (_field: string, params: Record<string, any>) =>
        `${
          params.max <= params.min
            ? `Your input value of ${params._value_} cant be higher than ${params.max}`
            : `This field should be between ${params.min} and ${params.max}`
        }`,
      max: 'This field should be less than {length}',
      min: 'This field should be greater than {length}',
      enoughBalance: 'Insufficient balance'
    }
  }
})

extend('injaddress', {
  validate: (value: string) => {
    try {
      getAddressFromInjectiveAddress(value)
    } catch (error: any) {
      return false
    }

    return value.startsWith('inj') || value.length !== 42
  }
})
extend('required', required)
extend('email', email)
extend('between', between)
extend('min', min)
extend('max', max)
extend('positiveNumber', (value: string) => {
  return NUMBER_REGEX.test(value)
})
extend('referralCode', (value: string) => {
  return REFER_CODE_REGEX.test(value)
})
extend('enoughBalance', {
  validate: (value: string | number, { min, max }: Record<string, any>) => {
    return Number(value) >= Number(min) && Number(value) <= Number(max)
  },
  params: ['min', 'max']
})
