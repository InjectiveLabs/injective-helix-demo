<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

const props = defineProps({
  isModalActive: Boolean
})

const emit = defineEmits<{
  (e: 'update:isModalActive', state: boolean): void
}>()

const showModal = computed<boolean>(
  () => modalStore.modals[Modal.SelectToken] && props.isModalActive
)

function closeModal() {
  modalStore.closeModal(Modal.SelectToken)

  emit('update:isModalActive', false)
}
</script>

<template>
  <AppModal :show="showModal" sm @modal:closed="closeModal">
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
