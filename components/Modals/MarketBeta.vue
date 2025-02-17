<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useSharedModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.MarketBeta])

function onCloseModal() {
  modalStore.closeModal(Modal.MarketBeta)
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm is-hide-close-button>
    <template #title>
      <h3>
        {{ $t('marketBeta.title') }}
      </h3>
    </template>

    <div class="relative">
      <p
        class="text-center text-sm text-coolGray-100"
        v-text="$t('marketBeta.description')"
      ></p>

      <div class="mt-6 flex items-center justify-center">
        <AppButton class="bg-blue-500 text-blue-900" @click="onCloseModal">
          {{ $t('marketBeta.I Understand') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
