<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

function closeModal() {
  modalStore.closeModal(Modal.TokenSelector)
}
</script>

<template>
  <AppModal
    :show="modalStore.modals[Modal.TokenSelector]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <div class="font-semibold text-base max-h-xs p-2 normal-case ml-2">
        {{ $t('trade.swap.tokenSelector.selectAToken') }}
      </div>
    </template>

    <div>
      <AppSelectTokenList
        class="-mt-8"
        show-balance
        v-bind="$attrs"
        @close="closeModal"
      />
    </div>
  </AppModal>
</template>
