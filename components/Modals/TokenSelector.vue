<script lang="ts" setup>
import { Modal } from '@/types'

const props = defineProps({
  modal: {
    required: false,
    default: Modal.TokenSelector,
    type: String as PropType<Modal>
  }
})

const modalStore = useModalStore()

function closeModal() {
  modalStore.closeModal(props.modal)
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[modal]"
    sm
    modal-content-class="overflow-y-hidden"
    @modal:closed="closeModal"
  >
    <template #title>
      <div class="font-semibold text-base max-h-xs p-2 normal-case ml-2">
        {{ $t('trade.swap.tokenSelector.selectAToken') }}
      </div>
    </template>

    <AppSelectTokenList
      show-balance
      v-bind="$attrs"
      class="overflow-y-auto"
      @close="closeModal"
    />
  </AppModal>
</template>
