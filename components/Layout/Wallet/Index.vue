<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { isCountryRestricted } from '@/app/data/geoip'
import { Modal, NavBarCyTags } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()
const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()

function onWalletConnect() {
  if (GEO_IP_RESTRICTIONS_ENABLED && !appStore.userState.hasAcceptedTerms) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function onModalOpen() {
  if (!GEO_IP_RESTRICTIONS_ENABLED) {
    return
  }

  if (isCountryRestricted(sharedGeoStore.country)) {
    modalStore.closeModal(Modal.Connect)
    modalStore.openModal(Modal.GeoRestricted)
  }
}

function onCloseModal() {
  modalStore.closeModal(Modal.Connect)
}
</script>

<template>
  <LayoutWalletDetails v-if="sharedWalletStore.isUserConnected" />

  <div v-else class="flex items-center justify-center gap-2">
    <UIcon
      v-if="sharedWalletStore.isAutoSignEnabled"
      :name="NuxtUiIcons.RotateAuto"
      class="text-white size-4"
    />

    <AppButton
      class="max-sm:px-1 max-sm:py-1 px-[18px] py-[5px] text-xs font-medium leading-5 mr-1 xl:mr-5 border-none"
      variant="primary"
      :data-cy="dataCyTag(NavBarCyTags.WalletLoginButton)"
      :is-loading="
        sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
      "
      @click="onWalletConnect"
    >
      <span>{{ $t('connect.connect') }}</span>
    </AppButton>
  </div>

  <AppModal
    v-model="modalStore.modals[Modal.Connect]"
    v-bind="{ isSm: true, isHideCloseButton: true }"
    @on:open="onModalOpen"
  >
    <LayoutWalletConnect @modal:closed="onCloseModal" />
  </AppModal>

  <ModalsTerms />
</template>
