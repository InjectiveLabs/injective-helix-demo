/* eslint-disable no-console */
import { Context } from '@nuxt/types'
import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TESTNET
} from '~/app/utils/constants'

const isErrorExcludedFromToast = (error: any): boolean => {
  const disabledPatterns = [
    /^(dmm \[inj)(.*)(\] didn't participate in the epoch \[epoch_)(.*)(])/
  ]

  const errorMessage =
    typeof error === 'object' && error !== null ? error.message : error || ''

  return disabledPatterns.some((pattern) => pattern.test(errorMessage))
}

const isErrorExcludedFromReporting = (error: any): boolean => {
  const disabledMessages = [
    'Your country is restricted from trading on this relayer',
    'Your IP address is detected as a proxy or you are using a VPN provider.',
    'Please make sure your Ledger device is connected, unlocked and your Ethereum app is open'
  ]
  const errorMessage =
    typeof error === 'object' && error !== null ? error.message : error || ''

  return (
    errorMessage.startsWith('Metamask:') ||
    errorMessage.includes('MetaMask') ||
    errorMessage.includes('Metamask') ||
    errorMessage.includes('metamask') ||
    errorMessage.includes('metamask') ||
    errorMessage.startsWith('cannot find epoch with id') ||
    errorMessage.startsWith('Failed to fetch') ||
    errorMessage.startsWith('Network Error') ||
    disabledMessages.includes(errorMessage) ||
    isErrorExcludedFromToast(error)
  )
}

const parseMessage = (error: any): string => {
  const message = error.message || error

  if (message.toLowerCase().includes('response closed')) {
    return 'Something happened. Please refresh the page.'
  }

  return `${message[0].toUpperCase()}${message.slice(1)}`
}

export default ({ app }: Context, inject: any) => {
  inject('onRejected', (error: Error) => {
    if (!isErrorExcludedFromToast(error)) {
      app.$toast.error(parseMessage(error))
    }

    if (IS_PRODUCTION && !isErrorExcludedFromReporting(error)) {
      app.$bugsnag.notify(error)
    }

    if (IS_DEVELOPMENT || IS_TESTNET) {
      console.error(error)
    }
  })

  inject('onError', (error: Error) => {
    if (!isErrorExcludedFromToast(error)) {
      app.$toast.error(parseMessage(error))
    }

    if (IS_PRODUCTION && !isErrorExcludedFromReporting(error)) {
      app.$bugsnag.notify(error)
    }

    if (IS_DEVELOPMENT || IS_TESTNET) {
      console.error(error)
    }
  })

  inject('onConfirm', <T extends Function>(message: string, callback: T) => {
    app.$toast.clear()
    return app.$toast.show(message, {
      duration: 10000,
      action: [
        {
          class: 'text-primary-500',
          text: 'Confirm',
          onClick: (_e: any, toastObject: any) => {
            toastObject.goAway(0)
            callback()
          }
        },
        {
          class: 'text-gray-300',
          text: 'Cancel',
          onClick: (_e: any, toastObject: any) => {
            toastObject.goAway(0)
          }
        }
      ]
    })
  })
}
