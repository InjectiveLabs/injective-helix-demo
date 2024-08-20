<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.GeoRestricted])

function onCloseModal() {
  modalStore.closeModal(Modal.GeoRestricted)
}
</script>

<template>
  <AppModal
    v-bind="{
      isSm: true,
      isOpen: isModalOpen
    }"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <div />
    </template>

    <div class="pb-8">
      <p class="font-bold text-md text-center">
        {{ $t('geoRestricted.description') }}
      </p>
    </div>
  </AppModal>
</template>
