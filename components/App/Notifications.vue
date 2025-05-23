<script lang="ts" setup>
import { MAX_TOAST_TIMEOUT } from '@shared/utils/constant'
import { SdkEventEmitter } from '@injectivelabs/wallet-core'
import { CtaToast } from '@/types'

const notificationStore = useSharedNotificationStore()
const { t } = useLang()

onMounted(() => {
  SdkEventEmitter.getInstance().on('transaction-signed', (data) => {
    if (data?.isTelemetry) {
      notificationStore.info({
        isTelemetry: true,
        key: CtaToast.Telemetry,
        timeout: MAX_TOAST_TIMEOUT,
        title: t('toast.broacastingTransaction')
      })
    }
  })

  SdkEventEmitter.getInstance().on('transaction-fail', (data) => {
    if (data?.isTelemetry) {
      notificationStore.close(CtaToast.Telemetry)
    }
  })
})
</script>

<template>
  <section>
    <template
      v-for="notification in notificationStore.notifications"
      :key="`notification-${notification.id}`"
    >
      <slot :notification="notification">
        <AppNotification v-bind="{ notification }" />
      </slot>
    </template>
  </section>
</template>
