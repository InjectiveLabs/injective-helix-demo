/* eslint-disable no-console */
import {
  ChainCosmosErrorCode,
  ErrorType,
  isThrownException,
  ThrownException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { StatusCodes } from 'http-status-codes'
import { defineNuxtPlugin } from '#imports'
import { IS_PRODUCTION, BUGSNAG_KEY } from '@/app/utils/constants'
import { Modal } from '@/types/enums'

const reportToUser = (error: ThrownException) => {
  const { error: errorToast } = useNotifications()
  const shouldIgnoreToast =
    ['referrals'].includes(error.contextModule as string) &&
    error.code === UnspecifiedErrorCode

  // Timedout requests happening in the background should not be reported to the user
  if (
    error.type === ErrorType.HttpRequest &&
    error.code === StatusCodes.REQUEST_TOO_LONG
  ) {
    return
  }

  if (shouldIgnoreToast) {
    return
  }

  errorToast({ title: error.message })
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
    useBugsnag().notify(error.toCompactError())
  }
}

const reportUnknownErrorToBugsnag = (error: Error) => {
  const newError = new Error(
    `The ${error.message} is not handled as an Exception - ${error.stack}`
  )

  console.warn(newError.message, newError.stack)
}

const handleInsufficientGas = (error: ThrownException) => {
  const modalStore = useModalStore()
  const bankStore = useBankStore()

  if (bankStore.hasEnoughInjForGas) {
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
    } else {
      console.error(error)
    }

    handleInsufficientGas(error)
  }

  return {
    provide: {
      onError: errorHandler
    }
  }
})
