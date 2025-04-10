<script lang="ts" setup>
import { commonCyTag } from '@shared/utils'
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
import { isCountryRestrictedFullAccess } from '@/app/data/geoip'
import { Modal, NavBarCyTags } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()
const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()

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
      :data-cy="commonCyTag(NavBarCyTags.WalletLoginButton)"
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
  >
    <LayoutWalletConnect @modal:closed="onCloseModal" />
  </AppModal>

  <ModalsTerms />
</template>
