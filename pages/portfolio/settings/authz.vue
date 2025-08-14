<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-base'
import { Modal, MainPage, BusEvents, PortfolioSubPage } from '@/types'

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

const modalStore = useSharedModalStore()

const linkOptions = [
  {
    label: 'portfolio.authZ.grantee',
    to: { name: PortfolioSubPage.SettingsAuthz }
  },
  {
    label: 'portfolio.authZ.granter',
    to: { name: PortfolioSubPage.SettingsAuthzGranter }
  }
]

function openGranteeModal() {
  useEventBus(BusEvents.ConnectMobileModalOpened).emit()
  modalStore.openModal(Modal.ConnectMobile)
}
</script>

<template>
  <div>
    <div class="p-4">
      <div class="flex items-center">
        <NuxtLink
          :to="{ name: PortfolioSubPage.Settings }"
          class="pr-4 flex items-center"
        >
          <UIcon :name="NuxtUiIcons.ChevronLeft" class="h-6 w-6 min-w-6" />
        </NuxtLink>

        <h3 class="portfolio-title">
          {{ $t('portfolio.authZ.title') }}
        </h3>
      </div>

      <div class="mt-8 flex justify-between">
        <div>
          <NuxtLink
            v-for="option in linkOptions"
            :key="option.label"
            :to="option.to"
            class="p-4 text-coolGray-400 font-medium"
            exact-active-class="text-white"
          >
            {{ $t(option.label) }}
          </NuxtLink>
        </div>
        <AppButton
          variant="primary-outline"
          class="flex-1 p-2 font-semibold cursor-pointer select-none text-left"
          @click="openGranteeModal"
        >
          + {{ $t('portfolio.authZ.connectMobile') }}
        </AppButton>
      </div>
    </div>

    <div class="border-y">
      <NuxtPage />
    </div>

    <ModalsConnectMobile />
  </div>
</template>
