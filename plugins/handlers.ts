/* eslint-disable no-console */
import {
  ErrorType,
  ThrownException,
  isThrownException,
  ChainCosmosErrorCode,
  TransactionException,
  formatNotificationDescription
} from '@injectivelabs/exceptions'
import { StatusCodes } from 'http-status-codes'
import { defineNuxtPlugin } from '#imports'
import { IS_PRODUCTION, BUGSNAG_KEY } from '@/app/utils/constants'
import { Modal } from '@/types/enums'

/**
 * As we conditionally include the nuxt-bugsnag module
 * the type of it can be undefined
 **/
declare let useBugsnag: () => any

const reportToUser = (error: ThrownException) => {
  const { error: errorToast } = useNotifications()

  // Timedout requests happening in the background should not be reported to the user
  if (
    error.type === ErrorType.HttpRequest &&
    error.code === StatusCodes.REQUEST_TOO_LONG
  ) {
    return
  }

  if (!(error instanceof TransactionException)) {
    return errorToast({
      title: error.message || 'Something happened'
    })
  }

  const { tooltip, description } = formatNotificationDescription(
    error.originalMessage
  )

  errorToast({ title: error.message, description, tooltip })
}

const reportToBugSnag = (error: ThrownException) => {
  if (!IS_PRODUCTION) {
    console.warn(error.toCompactError().message)
    console.error(error)

    return
  }

  if ([ErrorType.Unspecified, ErrorType.WalletError].includes(error.type)) {
    console.warn(error.toCompactError().message)
    console.error(error)

    return
  }

  if (BUGSNAG_KEY) {
    useBugsnag().notify(error, (event: any) => {
      event.errors[0].errorClass = error.errorClass || error.name

      if (useWalletStore().isUserWalletConnected) {
        event.setUser(useWalletStore().injectiveAddress)
      }

      event.addMetadata('error-context', error.toObject())
    })
  }
}

const reportUnknownErrorToBugsnag = (error: Error) => {
  if (!IS_PRODUCTION) {
    console.error({ error, stack: error.stack })
  }

  const newError = new Error(
    `The ${error.message} is not handled as an Exception - ${error.stack}`
  )

  console.warn(newError.message, newError.stack)

  if (BUGSNAG_KEY) {
    useBugsnag().notify(newError)
  }
}

const handleInsufficientGas = (error: ThrownException) => {
  const accountStore = useAccountStore()
  const modalStore = useModalStore()

  if (accountStore.hasEnoughInjForGas) {
    return
  }

  if (error.contextCode !== ChainCosmosErrorCode.ErrInsufficientFee) {
    return
  }

  modalStore.openModal({ type: Modal.InsufficientInjForGas })
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, context) => {
    console.warn(error, context, (error as any).stack)
  }

  window.onunhandledrejection = function (event: PromiseRejectionEvent) {
    const error = event.reason

    if (!IS_PRODUCTION) {
      return
    }

    if (!isThrownException(error)) {
      reportUnknownErrorToBugsnag(error)
    } else {
      reportToBugSnag(error)
    }
  }

  const errorHandler = (error: ThrownException) => {
    if (!isThrownException(error)) {
      return reportUnknownErrorToBugsnag(error)
    }

    reportToUser(error)

    if (IS_PRODUCTION) {
      reportToBugSnag(error)
    }

    console.warn(error.toObject())

    handleInsufficientGas(error)
  }

  return {
    provide: {
      onError: errorHandler
    }
  }
})
