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

function onCloseModal() {
  modalStore.closeModal(props.modal)
}
</script>
<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[modal]"
    is-sm
    modal-content-class="overflow-y-hidden"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <div class="font-semibold text-base max-h-xs p-2 normal-case ml-2">
        {{ $t('trade.swap.tokenSelector.selectAToken') }}
      </div>
    </template>

    <AppSelectTokenList
      is-balance-visible
      class="overflow-y-auto"
      v-bind="$attrs"
      @close="onCloseModal"
    />
  </AppModal>
</template>
