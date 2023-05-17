<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

function handleOpenSubaccountTransferModal() {
  modalStore.openModal({ type: Modal.SubaccountTransfer })
  modalStore.closeModal(Modal.CreateSubaccount)
}

function closeModal() {
  modalStore.closeModal(Modal.CreateSubaccount)
}
</script>

<template>
  <AppModal
    :show="modalStore.modals[Modal.CreateSubaccount]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>
        {{ $t('account.subaccountCreation') }}
      </h3>
    </template>

    <div>
      <i18n-t keypath="account.createSubaccountNote" tag="p" class="leading-6">
        <template #split>
          <div class="py-2" />
        </template>
        <template #faq>
          <a
            class="text-blue-400"
            href="https://helixapp.zendesk.com/hc/en-us"
            target="_blank"
          >
            FAQ
          </a>
        </template>
      </i18n-t>

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
