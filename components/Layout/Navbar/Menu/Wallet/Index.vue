<script setup lang="ts">
import { Wallet } from '@injectivelabs/wallet-ts'
import { POINTS_ITEM } from '@/app/data/menu'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

function openDepositQRModal() {
  if (sharedWalletStore.wallet !== Wallet.Magic) {
    modalStore.openModal(Modal.FiatOnboard)

    return
  }

  modalStore.openModal(Modal.DepositQr)
}
</script>

<template>
  <div class="flex items-center px-1">
    <LayoutNavbarMenuItem
      v-if="sharedWalletStore.isUserConnected"
      class="hidden lg:block"
      v-bind="{ item: POINTS_ITEM }"
    />

    <AppButton
      v-if="sharedWalletStore.isUserConnected"
      variant="primary-outline"
      size="sm"
      @click="openDepositQRModal"
    >
      {{ $t('common.deposit') }}
    </AppButton>

    <LayoutWallet />
  </div>
</template>
