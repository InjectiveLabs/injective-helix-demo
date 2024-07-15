/* eslint-disable no-console */
import {
  ErrorType,
  ThrownException,
  isThrownException,
  GRPC_REQUEST_FAILED,
  TransactionException,
  GrpcUnaryRequestException
} from '@injectivelabs/exceptions'
import { StatusCodes } from 'http-status-codes'
import { defineNuxtPlugin } from '#imports'
import { IS_PRODUCTION, BUGSNAG_KEY } from '@/app/utils/constants'

/**
 * As we conditionally include the nuxt-bugsnag module
 * the type of it can be undefined
 **/
declare let useBugsnag: () => any

const reportToUser = (error: ThrownException) => {
  const notificationStore = useSharedNotificationStore()

  console.log(error.toJson())

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
      title: 'The product is experiencing higher than usual demand',
      description:
        'Hang tight, engineers are doing their best to improve the performance and efficiency.'
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

      if (useSharedWalletStore().isUserConnected) {
        event.setUser(useSharedWalletStore().injectiveAddress)
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

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, context) => {
    console.log(error, context)

    console.warn(error, context, (error as any)?.stack)
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
  }

  return {
    provide: {
      onError: errorHandler
    }
  }
})
