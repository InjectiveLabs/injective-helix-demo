<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

function closeModal() {
  modalStore.closeModal(Modal.SubaccountTransfer)
}
</script>

<template>
  <AppModal
    :show="modalStore.modals[Modal.SubaccountTransfer]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>
        {{ $t('account.subaccountTransfer') }}
      </h3>
    </template>

    <div>
      <div class="mt-6">
        <AppButton
          lg
          class="w-full text-blue-900 bg-blue-500"
          @click="handleOpenSubaccountTransferModal"
        >
          <span class="font-semibold">
            {{ $t('account.createSubaccount') }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
