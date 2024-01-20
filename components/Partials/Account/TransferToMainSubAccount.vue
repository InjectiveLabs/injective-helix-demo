<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()

function onClick() {
  modalStore.openModal(Modal.TransferToMainSubaccount)
}
</script>

<template>
  <AppButton class="border border-blue-500" @click="onClick">
    <span class="text-blue-500 font-semibold">
      {{ $t('account.transferToMainSubaccount') }}
    </span>
  </AppButton>

  <ModalsSubaccountTransferToMainSubaccount />
</template>
