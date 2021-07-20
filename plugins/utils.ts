/* eslint-disable no-console */
import { Context } from '@nuxt/types'
import { excludedMessagesFromReporting } from '~/app/data/bugsnag'
import { IS_PRODUCTION } from '~/app/utils/constants'

export default ({ app }: Context, inject: any) => {
  inject('onRejected', (error: Error) => {
    app.$toast.error(error.message)

    const excludedErrorsForBugsnag =
      !excludedMessagesFromReporting.includes(error.message) ||
      error.message.includes('Metamask') ||
      error.message.includes('metamask')

    if (IS_PRODUCTION && excludedErrorsForBugsnag) {
      app.$bugsnag.notify(error)
    } else {
      console.error(error)
    }
  })
}
