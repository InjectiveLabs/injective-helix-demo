/* eslint-disable no-console */
import { Context } from '@nuxt/types'
import { IS_PRODUCTION } from '~/app/utils/constants'

export default ({ app }: Context, inject: any) => {
  inject('onRejected', (error: Error) => {
    app.$toast.error(error.message)
    if (IS_PRODUCTION) {
      app.$bugsnag.notify(error)
    } else {
      console.error(error)
    }
  })
}
