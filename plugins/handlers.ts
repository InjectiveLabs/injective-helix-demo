import { CtaToast } from '@shared/types'
import { defineNuxtPlugin } from '#imports'
import { StatusCodes } from 'http-status-codes'
import { BUGSNAG_KEY, IS_PRODUCTION } from '@shared/utils/constant'
import {
  ErrorType,
  isThrownException,
  GRPC_REQUEST_FAILED,
  TransactionException,
  GrpcUnaryRequestException,
  TurnkeyWalletSessionException
} from '@injectivelabs/exceptions'
import type { ThrownException } from '@injectivelabs/exceptions'

const reportToUser = (error: ThrownException) => {
  const notificationStore = useSharedNotificationStore()

  // Timedout requests happening in the background should not be reported to the user
  if (
    error.type === ErrorType.HttpRequest &&
    error.code === StatusCodes.REQUEST_TOO_LONG
  ) {
    return
  }

  if (
    error instanceof GrpcUnaryRequestException &&
    error.contextCode === GRPC_REQUEST_FAILED
  ) {
    return notificationStore.error({
      title: 'High demand detected',
      description: 'Engineers are improving performance and efficiency.'
    })
  }

  if (!(error instanceof TransactionException)) {
    return notificationStore.error({
      title: error.message || 'Something happened'
    })
  }

  notificationStore.error({
    title: error.message,
    context: error.originalMessage
  })
}

const reportToBugSnag = (error: ThrownException) => {
  if ([ErrorType.Unspecified, ErrorType.WalletError].includes(error.type)) {
    console.warn(error.toCompactError().message)
    console.error(error)

    return
  }

  if (!BUGSNAG_KEY) {
    return
  }

  useBugsnagNotifyThrownException(
    error,
    useSharedWalletStore().injectiveAddress
  )
}

const reportUnknownErrorToBugsnag = (error: Error) => {
  const newError = new Error(
    `The ${error.message} is not handled as an Exception - ${error.stack}`
  )

  console.warn(newError.message, newError.stack)

  if (!BUGSNAG_KEY) {
    return
  }

  useBugsnagNotifyThrownException(
    newError,
    useSharedWalletStore().injectiveAddress
  )
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, context) => {
    console.log(error, context)
    console.warn(error, context, (error as any)?.stack)
  }

  window.onunhandledrejection = function (event: PromiseRejectionEvent) {
    const error = event.reason

    if (!IS_PRODUCTION) {
      return console.error(error)
    }

    if (!isThrownException(error)) {
      reportUnknownErrorToBugsnag(error)
    } else {
      reportToBugSnag(error)
    }

    console.warn(error)
  }

  const errorHandler = (error: ThrownException) => {
    const sharedWalletStore = useSharedWalletStore()
    const notificationStore = useSharedNotificationStore()

    if (error.name === TurnkeyWalletSessionException.errorClass) {
      sharedWalletStore.logout()
    }

    notificationStore.close(CtaToast.Telemetry)

    if (error.name === TurnkeyWalletSessionException.errorClass) {
      sharedWalletStore.logout()
    }

    if (!isThrownException(error)) {
      return reportUnknownErrorToBugsnag(error)
    }

    reportToUser(error)

    if (IS_PRODUCTION) {
      reportToBugSnag(error)
    }

    console.error(error.toCompactError())
    console.warn(error.toObject())
  }

  return {
    provide: {
      onError: errorHandler
    }
  }
})
