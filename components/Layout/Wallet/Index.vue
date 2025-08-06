<script lang="ts" setup>
import { commonCyTag } from '@shared/utils'
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
import { isCountryRestrictedFullAccess } from '@/app/data/geoip'
import { Modal, NavBarCyTags } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()
const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()

function onCloseModal() {
  modalStore.closeModal(Modal.Connect)
  sharedWalletStore.walletConnectStatus = WalletConnectStatus.idle
}

function onWalletConnect() {
  if (isCountryRestrictedFullAccess(sharedGeoStore.country)) {
    modalStore.openModal(Modal.GeoRestricted)

    return
  }

  if (appStore.userState.hasAcceptedTerms) {
    modalStore.openModal(Modal.Terms)
    return
  }

  modalStore.openModal(Modal.Connect)
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
      class="px-[18px] py-[5px] text-xs font-medium leading-5 border-none"
      variant="primary"
      :data-cy="commonCyTag(NavBarCyTags.WalletLoginButton)"
      :is-loading="
        sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
      "
      @click="onWalletConnect"
    >
      <span>{{ $t('common.connect') }}</span>
    </AppButton>
  </div>

  <AppModal
    v-model="modalStore.modals[Modal.Connect]"
    v-bind="{ isSm: true, isHideCloseButton: true }"
    @on:close="onCloseModal"
  >
    <LayoutWalletConnect @modal:closed="onCloseModal" />
  </AppModal>

  <ModalsTerms />
</template>
