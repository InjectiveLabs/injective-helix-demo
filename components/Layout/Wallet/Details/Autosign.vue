<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-base'
import { Status, StatusType } from '@injectivelabs/utils'
import { MAX_TOAST_TIMEOUT } from '@shared/utils/constant'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { trackGenericEvent } from '@/app/providers/mixpanel/EventTracker'
import { BusEvents, HelixCtaToast, MixPanelEvent } from '@/types'

const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

onMounted(() => {
  useEventBus(BusEvents.NotificationClosed).on((notificationId) => {
    if (notificationId === HelixCtaToast.EnableAutoSign) {
      status.setIdle()
    }
  })
})

function toggleAutoSign() {
  if (sharedWalletStore.isAuthzWalletConnected) {
    sharedWalletStore.resetAuthZ()

    return
  }

  if (sharedWalletStore.isAutoSignEnabled) {
    sharedWalletStore.disconnectAutoSign()

    return
  }

  if ([Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)) {
    return
  }

  trackGenericEvent(MixPanelEvent.AutoSignCTAPopUp)
  notificationStore.success({
    title: t('toast.portfolio.autoSign.enable.title'),
    description: t('toast.portfolio.autoSign.enable.description'),
    timeout: MAX_TOAST_TIMEOUT,
    icon: NuxtUiIcons.RotateAuto,
    key: HelixCtaToast.EnableAutoSign,
    actions: [
      {
        label: t('common.enable'),
        callback: () => {
          trackGenericEvent(MixPanelEvent.AutoSignCTAEnabled)

          sharedWalletStore
            .connectAutoSign(
              TRADING_MESSAGES
              // CONTRACT_EXECUTION_COMPAT_AUTHZ // TODO: Add this when we have authz contract exec support
            )
            .then(() => {
              notificationStore.update({
                title: t('toast.portfolio.autoSign.enabledToast.title'),
                description: t(
                  'toast.portfolio.autoSign.enabledToast.description'
                )
              })
            })
            .catch($onError)
            .finally(() => status.setIdle())
        }
      }
    ]
  })

  status.setLoading()
}
</script>

<template>
  <div
    v-if="![Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)"
    class="mx-3 w-6 h-6 flex items-center justify-center"
  >
    <AppSpinner v-if="status.isLoading()" is-sm is-white />

    <AppTooltip
      v-else
      :ui="{ width: 'w-auto' }"
      :content="$t('trade.eip712Warning')"
      :is-disabled="!sharedWalletStore.isEip712"
    >
      <UIcon
        class="w-6 h-6 rounded-md transition-colors"
        :name="NuxtUiIcons.RotateAuto"
        :class="[
          sharedWalletStore.isAutoSignEnabled ||
          sharedWalletStore.isAuthzWalletConnected
            ? 'text-green-500'
            : 'text-white hover:text-coolGray-400'
        ]"
        @click="toggleAutoSign"
      />
    </AppTooltip>
  </div>
</template>
