/* eslint-disable no-console */
import { Context } from '@nuxt/types'
import { IS_PRODUCTION } from '~/app/utils/constants'

const isErrorExcludedFromReporting = (error: any): boolean => {
  const errorMessage =
    typeof error === 'object' && error !== null ? error.message : error || ''

  return (
    errorMessage.startsWith('Metamask:') ||
    errorMessage.includes('MetaMask') ||
    errorMessage.includes('Metamask') ||
    errorMessage.includes('metamask')
  )
}

export default ({ app }: Context, inject: any) => {
  inject('onRejected', (error: Error) => {
    app.$toast.error(error.message)

    if (IS_PRODUCTION && !isErrorExcludedFromReporting(error)) {
      app.$bugsnag.notify(error)
    } else {
      console.error(error)
    }
  })
}
