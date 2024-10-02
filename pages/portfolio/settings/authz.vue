<script setup lang="ts">
import { PortfolioSubPage, Modal, BusEvents } from '@/types'

const modalStore = useModalStore()
const appStore = useAppStore()
const linkOptions = [
  {
    label: 'portfolio.settings.authz.grantee',
    to: { name: PortfolioSubPage.SettingsAuthz }
  },
  {
    label: 'portfolio.settings.authz.granter',
    to: { name: PortfolioSubPage.SettingsAuthzGranter }
  }
]

function openGranteeModal() {
  useEventBus(BusEvents.ConnectMobileModalOpened).emit()
  modalStore.openModal(Modal.ConnectMobile)
}
</script>

<template>
  <div class="">
    <div class="p-4">
      <div class="flex items-center">
        <NuxtLink :to="{ name: PortfolioSubPage.Settings }" class="pr-4">
          <SharedIcon name="chevron" />
        </NuxtLink>

        <h3 class="portfolio-title">
          {{ $t('portfolio.settings.authz.title') }}
        </h3>
      </div>

      <div class="mt-8 flex justify-between">
        <div>
          <NuxtLink
            v-for="option in linkOptions"
            :key="option.label"
            :to="option.to"
            class="p-4 text-gray-400 font-medium"
            exact-active-class="text-white"
          >
            {{ $t(option.label) }}
          </NuxtLink>
        </div>
        <div v-if="appStore.devMode">
          <button
            :disabled="isDisabled"
            class="flex-1 p-2 font-semibold cursor-pointer select-none text-left"
            :class="{
              'text-gray-500': isDisabled,
              'text-blue-500 hover:text-blue-600': !isDisabled
            }"
            @click="openGranteeModal"
          >
            + {{ $t('portfolio.settings.authz.connectMobile') }}
          </button>
        </div>
      </div>
    </div>

    <div class="border-y">
      <NuxtPage />
    </div>
  </div>
  <ModalsConnectMobile />
</template>
