<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

const emit = defineEmits<{
  submit: []
}>()

function closeModal() {
  modalStore.closeModal(Modal.LiquidationWarning)
}

function onModalClose() {
  closeModal()
}

function confirm() {
  emit('submit')
  closeModal()
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.LiquidationWarning]"
    is-sm
    @modal:closed="onModalClose"
  >
    <template #title>
      <div class="text-orange-300 flex space-x-1 items-center justif-center">
        <SharedIcon name="warning-triangle" is-md />
        <h3 class="normal-case text-lg">
          {{ $t('trade.liquidationModal.title') }}
        </h3>
      </div>
    </template>

    <div class="relative">
      <div class="flex flex-col gap-4">
        <p>
          {{ $t('trade.liquidationModal.description') }}
        </p>
      </div>

      <div class="mt-6 flex items-center justify-center gap-2">
        <AppButton class="bg-blue-500 text-blue-900 w-full" @click="confirm">
          {{ $t('trade.liquidationModal.cta') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
