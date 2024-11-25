<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { WalletConnectStatus } from '@shared/types'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { isCountryRestricted } from '@/app/data/geoip'
import { Modal, NavBarCyTags } from '@/types'

const modalStore = useModalStore()
const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()

const isSignUp = ref(false)

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

function onSignUp() {
  isSignUp.value = true
  onWalletConnect()
}

function onSignIn() {
  isSignUp.value = false
  onWalletConnect()
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

  <div v-else class="flex items-center space-x-2">
    <AppButton
      class="max-sm:px-2 max-sm:py-1"
      variant="primary-outline"
      :data-cy="dataCyTag(NavBarCyTags.WalletLoginButton)"
      :is-loading="
        sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
      "
      @click="onSignIn"
    >
      <span>{{ $t('connect.login') }}</span>
    </AppButton>
    <AppButton
      class="max-sm:px-2 max-sm:py-1"
      :data-cy="dataCyTag(NavBarCyTags.WalletSignUpButton)"
      :is-loading="
        sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
      "
      @click="onSignUp"
    >
      <span>{{ $t('connect.signUp') }}</span>
    </AppButton>
  </div>

  <SharedModal v-model="isOpen">
    <LayoutWalletConnect v-bind="{ isSignUp }" @modal:closed="onCloseModal" />
  </SharedModal>

  <ModalsTerms />
</template>
