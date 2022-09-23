/* eslint-disable no-console */
import {
  ChainCosmosErrorCode,
  ErrorType,
  isThrownException,
  ThrownException
} from '@injectivelabs/exceptions'
import { isCosmosWallet } from '@injectivelabs/wallet-ts'
import { Context } from '@nuxt/types'
import { IS_PRODUCTION } from '~/app/utils/constants'
import { Modal } from '~/types/enums'

const reportToBugSnag = (bugsnag: any, error: ThrownException) => {
  if (!IS_PRODUCTION) {
    console.warn(error.toCompactError().message)

    return console.error(error)
  }

  if ([ErrorType.Unspecified, ErrorType.WalletError].includes(error.type)) {
    console.warn(error.toCompactError().message)

    return console.error(error)
  }

  if (bugsnag) {
    bugsnag.notify(error.toCompactError())
  }
}

const reportUnknownErrorToBugsnag = (bugsnag: any, error: Error) => {
  const newError = new Error(
    `The ${error.message} is not handled as an Exception - ${error.stack}`
  )

  if (bugsnag) {
    bugsnag.notify(newError)
  }

  console.warn(newError.message)
}

const notifyTheUser = (toast: any, error: ThrownException) => {
  return toast.error(error.message)
}

const handleInsufficientGas = ($accessor: any, error: ThrownException) => {
  const { wallet } = $accessor.wallet

  if (!isCosmosWallet(wallet)) {
    return
  }

  if (error.contextCode !== ChainCosmosErrorCode.ErrInsufficientFee) {
    return
  }

  return $accessor.modal.openModal(Modal.InsufficientInjForGas)
}

export default (
  { app: { $accessor, $bugsnag }, $toast }: Context,
  inject: any
) => {
  const errorHandler = (error: ThrownException) => {
    notifyTheUser($toast, error)

    if (!isThrownException(error)) {
      return reportUnknownErrorToBugsnag(error, $bugsnag)
    }

    reportToBugSnag($bugsnag, error)
    handleInsufficientGas($accessor, error)
  }

  const confirmHandler = <T extends Function>(message: string, callback: T) => {
    $toast.clear()

    return $toast.show(message, {
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
  }

  inject('onRejected', errorHandler)
  inject('onError', errorHandler)
  inject('onConfirm', confirmHandler)
}
