<script lang="ts" setup>
import { DEFAULT_PRICE_WARNING_DEVIATION } from '@/app/utils/constants'
import { Modal } from '@/types'

const emit = defineEmits<{
  (e: 'order:confirmed'): void
}>()

const modalStore = useModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.PriceDeviation])

function confirm() {
  emit('order:confirmed')
  close()
}

function close() {
  modalStore.closeModal(Modal.PriceDeviation)
}
</script>

<template>
  <AppModal
    :show="isModalOpen"
    data-cy="price-deviation-modal"
    sm
    @modal:closed="close"
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
          @click="close"
        >
          {{ $t('common.cancel') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
