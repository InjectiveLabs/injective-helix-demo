<script lang="ts" setup>
import { DEFAULT_PRICE_WARNING_DEVIATION } from '@/app/utils/constants'
import { Modal } from '@/types'

const emit = defineEmits<{
  'order:confirmed': []
}>()

const modalStore = useSharedModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.PriceDeviation])

function closeModal() {
  modalStore.closeModal(Modal.PriceDeviation)
}

function onModalClose() {
  closeModal()
}

function confirm() {
  emit('order:confirmed')
  closeModal()
}
</script>

<template>
  <AppModal
    :is-open="isModalOpen"
    data-cy="price-deviation-modal"
    is-sm
    @modal:closed="onModalClose"
  >
    <template #title>
      <h3>
        {{ $t('trade.confirmOrderExecution') }}
      </h3>
    </template>

    <div class="relative">
      <p>
        {{
          $t('trade.high_execution_price_deviation_warning_note', {
            percentage: DEFAULT_PRICE_WARNING_DEVIATION
          })
        }}
      </p>
      <div class="mt-6 flex items-center justify-center gap-2">
        <AppButton
          class="bg-blue-500 text-blue-900"
          data-cy="confirm-order-modal-confirm-button"
          @click="confirm"
        >
          {{ $t('common.confirm') }}
        </AppButton>

        <AppButton
          class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
          data-cy="confirm-order-modal-confirm-button"
          @click="closeModal"
        >
          {{ $t('common.cancel') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
