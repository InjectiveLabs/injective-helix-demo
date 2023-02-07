<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

function closeModal() {
  modalStore.closeModal(Modal.InsufficientInjForGas)
}
</script>

<template>
  <AppModal
    :show="modalStore.modals[Modal.InsufficientInjForGas]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>
        {{ $t('insufficientGas.insufficientGas') }}
      </h3>
    </template>

    <CommonInsufficientGasInner :hide-title="true" @close="closeModal" />
  </AppModal>
</template>
