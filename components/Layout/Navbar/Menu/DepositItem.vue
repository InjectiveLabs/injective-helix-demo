<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-ts'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

withDefaults(
  defineProps<{
    label: string
  }>(),
  {}
)

function openDepositQRModal() {
  if (sharedWalletStore.wallet === Wallet.Magic) {
    modalStore.openModal(Modal.FiatOnboard)

    return
  }

  modalStore.openModal(Modal.DepositQr)
}
</script>

<template>
  <div @click="openDepositQRModal">
    <slot>
      <div
        class="group/item block text-xs text-white hover:text-blue-550 font-semibold w-full rounded p-1 cursor-pointer"
      >
        <div class="inline-block">
          {{ $t(label) }}
        </div>
      </div>
    </slot>
  </div>
</template>
