<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-base'
import { Status, StatusType } from '@injectivelabs/utils'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { MainPage, BusEvents, PortfolioSubPage } from '@/types'

definePageMeta({
  middleware: [
    () => {
      const sharedWalletStore = useSharedWalletStore()

      if ([Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)) {
        return navigateTo({ name: MainPage.Index })
      }
    }
  ]
})

const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const isAutoSignEnabled = computed({
  get: () => sharedWalletStore.isAutoSignEnabled,
  set: (value: boolean) => {
    if (value) {
      connectAutoSign()

      return
    }

    disconnectAutoSign()
  }
})

function connectAutoSign() {
  status.setLoading()

  sharedWalletStore
    .connectAutoSign(
      TRADING_MESSAGES
      // CONTRACT_EXECUTION_COMPAT_AUTHZ // TODO: Add this when we have authz contract exec support
    )
    .then(() => {
      useEventBus(BusEvents.AutoSignConnected).emit()

      notificationStore.success({
        title: t('toast.portfolio.autoSign.enabledToast.title'),
        description: t('toast.portfolio.autoSign.enabledToast.description')
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
        title: t('toast.portfolio.autoSign.disabledToast')
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
        {{ $t('portfolio.autoSign.pageTitle') }}
      </h3>
    </div>

    <div class="border-y divide-y">
      <div class="flex flex-col p-4">
        <div class="max-w-xl text-xs mb-8 space-y-4 text-coolGray-350">
          <div>
            <p>{{ $t('portfolio.autoSign.content1.description1') }}</p>
            <p>{{ $t('portfolio.autoSign.content1.description2') }}</p>
          </div>

          <div>
            <p>
              {{ $t('portfolio.autoSign.content2.title') }}
            </p>

            <ul class="list-disc pl-4">
              <li>{{ $t('portfolio.autoSign.content2.description1') }}</li>
              <li>{{ $t('portfolio.autoSign.content2.description2') }}</li>
              <li>{{ $t('portfolio.autoSign.content2.description3') }}</li>
            </ul>
          </div>

          <div>
            <p>
              {{ $t('portfolio.autoSign.content3.title') }}
            </p>

            <ul class="list-disc pl-4">
              <li>{{ $t('portfolio.autoSign.content3.description1') }}</li>
              <li>{{ $t('portfolio.autoSign.content3.description2') }}</li>
              <li>{{ $t('portfolio.autoSign.content3.description3') }}</li>
            </ul>
          </div>
        </div>

        <AppButton
          v-if="sharedWalletStore.isAuthzWalletConnected"
          size="sm"
          :disabled="true"
        >
          {{ $t('common.notAvailableinAuthZMode') }}
        </AppButton>

        <template v-else>
          <div class="flex items-center gap-6">
            <div>
              <p class="text-sm font-medium">
                {{ $t('portfolio.autoSign.title') }}
              </p>
              <p class="text-xs text-coolGray-350">
                {{ $t('portfolio.autoSign.durationDescription') }}
              </p>
            </div>

            <AppSpinner v-if="status.isLoading()" is-sm is-white />
            <AppSwitch
              v-else
              v-model="isAutoSignEnabled"
              :is-disabled="
                sharedWalletStore.isEip712 &&
                !sharedWalletStore.isAutoSignEnabled
              "
            />
          </div>

          <span
            v-if="sharedWalletStore.isEip712"
            class="text-orange-500 text-xs mt-2"
          >
            {{ $t('trade.eip712Warning') }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
