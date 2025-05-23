<script lang="ts" setup>
import { walletStrategy } from '@shared/WalletService'
import { MAX_TOAST_TIMEOUT } from '@shared/utils/constant'
import { CtaToast } from '@/types'

const notificationStore = useSharedNotificationStore()
const { t } = useLang()

onMounted(() => {
  walletStrategy.on('transaction-signed', onTransactionSigned)
  walletStrategy.on('transaction-fail', onTransactionFail)
})

onUnmounted(() => {
  walletStrategy.off('transaction-signed', onTransactionSigned)
  walletStrategy.off('transaction-fail', onTransactionFail)
})

function onTransactionSigned(data?: Record<string, any>) {
  if (data?.isTelemetry) {
    notificationStore.info({
      isTelemetry: true,
      key: CtaToast.Telemetry,
      timeout: MAX_TOAST_TIMEOUT,
      title: t('toast.broacastingTransaction')
    })
  }
}

function onTransactionFail(data?: Record<string, any>) {
  if (data?.isTelemetry) {
    notificationStore.close(CtaToast.Telemetry)
  }
}
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
