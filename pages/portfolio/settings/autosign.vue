<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  TRADING_MESSAGES,
  CONTRACT_EXECUTION_COMPAT_AUTHZ
} from '@/app/data/trade'
import { BusEvents, PortfolioSubPage } from '@/types'

const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

function connectAutoSign() {
  status.setLoading()

  sharedWalletStore
    .connectAutoSign(TRADING_MESSAGES, CONTRACT_EXECUTION_COMPAT_AUTHZ)
    .then(() => {
      useEventBus(BusEvents.AutoSignConnected).emit()

      notificationStore.success({
        title: t('portfolio.settings.autoSign.enabledToast.title'),
        description: t('portfolio.settings.autoSign.enabledToast.description')
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function disconnectAutoSign() {
  status.setLoading()

  sharedWalletStore
    .disconnectAutoSign()
    .then(() => {
      notificationStore.success({
        title: t('portfolio.settings.autoSign.disabledToast.title')
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div>
    <div class="flex items-center p-4">
      <NuxtLink
        :to="{ name: PortfolioSubPage.Settings }"
        class="pr-4 flex items-center"
      >
        <UIcon :name="NuxtUiIcons.ChevronLeft" class="h-6 w-6 min-w-6" />
      </NuxtLink>

      <h3 class="portfolio-title">
        {{ $t('portfolio.settings.autoSign.title') }}
      </h3>
    </div>

    <div class="border-y divide-y">
      <div class="flex flex-col items-center p-4">
        <p class="max-w-3xl text-sm mb-8">
          {{ $t('portfolio.settings.autoSign.howItWorks') }}
        </p>

        <AppButton
          v-if="sharedWalletStore.isAuthzWalletConnected"
          :disabled="true"
        >
          {{ $t('common.notAvailableinAuthZMode') }}
        </AppButton>

        <AppButton
          v-else-if="!sharedWalletStore.isAutoSignEnabled"
          variant="success"
          :status="status"
          @click="connectAutoSign"
        >
          {{ $t('portfolio.settings.autoSign.enable') }}
        </AppButton>
        <AppButton
          v-else
          variant="danger"
          :status="status"
          @click="disconnectAutoSign"
        >
          {{ $t('portfolio.settings.autoSign.disconnect') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
