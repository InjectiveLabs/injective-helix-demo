<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()

function onTransferToMainSubaccountClick() {
  modalStore.openModal(Modal.TransferToMainSubaccount)
}
</script>

<template>
  <AppButton
    class="border border-blue-500"
    @click="onTransferToMainSubaccountClick"
  >
    <span class="text-blue-500 font-semibold">
      {{ $t('account.transferToMainSubaccount') }}
    </span>
  </AppButton>

  <ModalsSubaccountTransferToMainSubaccount />
</template>
