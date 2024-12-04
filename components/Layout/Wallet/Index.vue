<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { WalletConnectStatus } from '@shared/types'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { isCountryRestricted } from '@/app/data/geoip'
import { Modal, NavBarCyTags } from '@/types'

const modalStore = useSharedModalStore()
const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()

function onWalletConnect() {
  if (GEO_IP_RESTRICTIONS_ENABLED) {
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

const isOpen = computed({
  get: () => modalStore.modals[Modal.Connect],
  set: (value) => {
    if (value) {
      onModalOpen()
    } else {
      onCloseModal()
    }

    modalStore.modals[Modal.Connect] = value
  }
})
</script>

<template>
  <LayoutWalletDetails v-if="sharedWalletStore.isUserConnected" />

  <AppButton
    v-else
    class="max-sm:px-1 max-sm:py-1 h-[30px] w-20 text-xs font-medium leading-5 mr-1 xl:mr-5"
    variant="primary"
    :data-cy="dataCyTag(NavBarCyTags.WalletLoginButton)"
    :is-loading="
      sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
    "
    @click="onWalletConnect"
  >
    <span>{{ $t('connect.connect') }}</span>
  </AppButton>

  <SharedModal v-model="isOpen">
    <LayoutWalletConnect @modal:closed="onCloseModal" />
  </SharedModal>

  <ModalsTerms />
</template>
