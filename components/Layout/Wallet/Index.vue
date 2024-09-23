<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { WalletConnectStatus } from '@shared/types'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { isCountryRestricted } from '@/app/data/geoip'
import { Modal, NavBarCyTags } from '@/types'

const modalStore = useModalStore()

const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()

const isModalOpen = computed<boolean>(() => modalStore.modals[Modal.Connect])

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
</script>

<template>
  <LayoutWalletDetails v-if="sharedWalletStore.isUserConnected" />

  <AppButton
    v-else
    class="min-w-[110px] md:min-w-[160px]"
    :data-cy="dataCyTag(NavBarCyTags.WalletConnectButton)"
    :is-loading="
      sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
    "
    @click="onWalletConnect"
  >
    <span class="md:hidden">{{ $t('connect.connect') }}</span>
    <span class="max-md:hidden">{{ $t('connect.connectWallet') }}</span>
  </AppButton>

  <AppModal
    v-bind="{
      isOpen: isModalOpen,
      isTransparent: true
    }"
    @modal:open="onModalOpen"
    @modal:closed="onCloseModal"
  >
    <LayoutWalletConnect />
  </AppModal>

  <ModalsTerms />
</template>
