<script lang="ts" setup>
import { WalletStrategyEmitterEventType } from '@injectivelabs/wallet-core'
import { walletStrategy, autoSignWalletStrategy } from '@shared/WalletService'
import {
  MAX_TOAST_TIMEOUT,
  DEFAULT_NOTIFICATION_TIMEOUT
} from '@shared/utils/constant'
import { CtaToast } from '@/types'
import type { WalletStrategy } from '@injectivelabs/wallet-strategy'

const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const strategyList = [walletStrategy, autoSignWalletStrategy]

const eventList = {
  [WalletStrategyEmitterEventType.TransactionFail]: onTransactionFail,
  [WalletStrategyEmitterEventType.DoneTelemetryToast]: onDoneTelemetryToast,
  [WalletStrategyEmitterEventType.StartTelemetryToast]: onStartTelemetryToast
}

onMounted(() => {
  strategyList.forEach((strategy) => registerEvents(strategy))
})

onUnmounted(() => {
  strategyList.forEach((strategy) => unregisterEvents(strategy))
})

function registerEvents(strategy: WalletStrategy) {
  ;(Object.keys(eventList) as Array<keyof typeof eventList>).forEach((key) => {
    strategy.on(key, eventList[key])
  })
}

function unregisterEvents(strategy: WalletStrategy) {
  ;(Object.keys(eventList) as Array<keyof typeof eventList>).forEach((key) => {
    strategy.off(key, eventList[key])
  })
}

function onDoneTelemetryToast(data: undefined | Record<string, any>) {
  if (!data?.timeElapsed) {
    return
  }

  const timeElapsed = (data.timeElapsed / 1000).toFixed(2)

  notificationStore.update(CtaToast.Telemetry, {
    isTelemetry: false,
    data: { txHash: data?.txHash || '' },
    timeout: DEFAULT_NOTIFICATION_TIMEOUT,
    title: t('toast.transactionFinalized', { duration: timeElapsed })
  })
}

function onStartTelemetryToast() {
  notificationStore.info({
    isTelemetry: true,
    key: CtaToast.Telemetry,
    timeout: MAX_TOAST_TIMEOUT,
    title: t('toast.broacastingTransaction')
  })
}

function onTransactionFail() {
  notificationStore.close(CtaToast.Telemetry)
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
