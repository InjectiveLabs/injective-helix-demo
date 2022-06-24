/* eslint-disable no-console */
import { Wallet } from '@injectivelabs/ts-types'
import { Context } from '@nuxt/types'
import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TESTNET
} from '~/app/utils/constants'
import { Modal } from '~/types/enums'

const isErrorExcludedFromToast = (error: any): boolean => {
  const disabledPatterns = [
    //
  ] as RegExp[]

  const errorMessage =
    typeof error === 'object' && error !== null ? error.message : error || ''

  return disabledPatterns.some((pattern) => pattern.test(errorMessage))
}

const isInsufficientGasError = (error: any): boolean => {
  const errorMessage =
    typeof error === 'object' && error !== null ? error.message : error || ''

  return errorMessage.includes('insufficient funds')
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
  if (!error.message) {
    return ''
  }

  if (isInsufficientGasError(error.message)) {
    return 'Insufficient INJ to pay for gas/transaction fees.'
  }

  if (error.message.toLowerCase().includes('response closed')) {
    return 'Something happened. Please refresh the page.'
  }

  return `${error.message[0].toUpperCase()}${error.message.slice(1)}`
}

export default ({ app }: Context, inject: any) => {
  const bugsnag = app.$bugsnag

  inject('onRejected', (error: Error) => {
    if (
      isInsufficientGasError(error) &&
      app.$accessor.wallet.wallet !== Wallet.Metamask
    ) {
      app.$accessor.modal.openModal(Modal.InsufficientInjForGas)
    }

    if (!isErrorExcludedFromToast(error)) {
      app.$toast.error(parseMessage(error))
    }

    if (bugsnag && IS_PRODUCTION && !isErrorExcludedFromReporting(error)) {
      bugsnag.notify(error)
    }

    if (IS_DEVELOPMENT || IS_TESTNET) {
      console.error(error)
    }
  })

  inject('onError', (error: Error) => {
    if (
      isInsufficientGasError(error) &&
      app.$accessor.wallet.wallet !== Wallet.Metamask
    ) {
      app.$accessor.modal.openModal(Modal.InsufficientInjForGas)
    }

    if (!isErrorExcludedFromToast(error)) {
      app.$toast.error(parseMessage(error))
    }

    if (bugsnag && IS_PRODUCTION && !isErrorExcludedFromReporting(error)) {
      bugsnag.notify(error)
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
