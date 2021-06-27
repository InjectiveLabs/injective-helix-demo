import { extend, localize } from 'vee-validate'
import { required, email, min, max, between } from 'vee-validate/dist/rules'
import { NUMBER_REGEX } from '~/app/utils/constants'

localize({
  en: {
    messages: {
      required: 'This field is required',
      positiveNumber: 'This field is not a valid number',
      email: 'This field should be a valid email',
      between: 'This field should be between {min} and {max}',
      max: 'This field should be less than {length}',
      min: 'This field should be greater than {length}'
    }
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
