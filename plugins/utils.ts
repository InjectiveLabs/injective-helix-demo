/* eslint-disable no-console */
import * as constants from '~/app/utils/constants'
import * as formatters from '~/app/utils/formatters'
import * as transformers from '~/app/transformers'
import { Context } from '@nuxt/types'
import * as enums from '~/types/enums'

export interface Utils {
  $constants: typeof constants
  $formatters: typeof formatters
  $enums: typeof enums
  $transformers: typeof transformers
  $onRejected: (error: Error) => void
}

export default ({ app }: Context, inject: any) => {
  inject('onRejected', (error: Error) => {
    if (constants.IS_PRODUCTION) {
      app.$bugsnag.notify(error)
      app.$toast.error(error.message)
    } else {
      console.error(error)
    }
  })
  inject('constants', constants)
  inject('enums', enums)
  inject('formatters', formatters)
  inject('transformers', transformers)
}
