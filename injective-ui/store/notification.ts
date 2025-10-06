import { defineStore } from 'pinia'
import {
  ENDPOINTS,
  LONG_TOAST_TEXT,
  MAX_TOAST_TIMEOUT,
  DEFAULT_NOTIFICATION_TIMEOUT
} from '../utils/constant/index'
import { CtaToast, NotificationType } from './../types'
import type { Notification, NotificationOptions } from './../types'
import { ChainGrpcTendermintApi, type TxResponse } from '@injectivelabs/sdk-ts'

type NotificationStoreState = {
  notifications: Notification[]
  txResponse: TxResponse | null
}

const initialStateFactory = (): NotificationStoreState => ({
  txResponse: null,
  notifications: []
})

export const useSharedNotificationStore = defineStore('sharedNotification', {
  state: (): NotificationStoreState => initialStateFactory(),
  actions: {
    notify(options: NotificationOptions, type: NotificationType) {
      const notificationStore = useSharedNotificationStore()

      const defaultTimeout =
        options.title.length > LONG_TOAST_TEXT
          ? DEFAULT_NOTIFICATION_TIMEOUT
          : 4000

      const notificationTitleAlreadyExist =
        notificationStore.notifications.some(
          (notification) =>
            notification.title.toLowerCase() === options.title.toLowerCase()
        )

      if (notificationTitleAlreadyExist) {
        return
      }

      notificationStore.$patch({
        notifications: [
          ...notificationStore.notifications,
          {
            type,
            id: Date.now(),
            title:
              options.title.charAt(0).toUpperCase() + options.title.slice(1),
            key: options.key,
            icon: options.icon,
            context: options.context,
            actions: options.actions,
            txHash: options.txHash || '',
            description: options.description,
            isTelemetry: options.isTelemetry,
            timeout: options.timeout || defaultTimeout
          }
        ]
      })
    },

    clear(id: number) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.$patch({
        txResponse: null,
        notifications: notificationStore.notifications.filter(
          (notification) => notification.id !== id
        )
      })
    },

    success(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Success)
    },

    error(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Error)
    },

    info(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Info)
    },

    warning(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Warning)
    },

    close(key: string) {
      const notificationStore = useSharedNotificationStore()

      const selectedNotification = notificationStore.notifications.find(
        (notification) => notification.key === key
      )

      if (selectedNotification) {
        notificationStore.clear(selectedNotification.id)
      }
    },

    async update(
      options: Partial<NotificationOptions>,
      key: string = CtaToast.Telemetry
    ) {
      const notificationStore = useSharedNotificationStore()

      const selectedNotification = [...notificationStore.notifications]
        .reverse()
        .find((notification) => notification.key === key)

      if (selectedNotification) {
        if (selectedNotification.isTelemetry && !options.actions) {
          options.timeout = DEFAULT_NOTIFICATION_TIMEOUT
        }

        options.isTelemetry = false

        try {
          if (notificationStore.txResponse) {
            const endTimeTx = notificationStore.txResponse.timestamp
              ? new Date(notificationStore.txResponse.timestamp).getTime()
              : 0

            const txBlock = await new ChainGrpcTendermintApi(
              ENDPOINTS.grpc
            ).fetchBlock(notificationStore.txResponse.height)

            const endTimeTxBlock = txBlock?.header?.time
              ? new Date(txBlock?.header?.time).getTime()
              : 0

            const timeElapsed = endTimeTxBlock - endTimeTx
            const formattedTimeElapsed = (timeElapsed / 1000)
              .toFixed(2)
              .replace(/\.?0+$/, '')

            options.timeElapsed = formattedTimeElapsed
            options.txHash = notificationStore.txResponse.txHash
          }

          Object.assign(selectedNotification, options)
        } catch (error) {
          Object.assign(selectedNotification, options)
        }
      }
    },

    initTelemetry() {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(
        {
          isTelemetry: true,
          key: CtaToast.Telemetry,
          timeout: MAX_TOAST_TIMEOUT,
          title: 'Broadcasting transaction...'
        },
        NotificationType.Success
      )
    }
  }
})
