<script lang="ts" setup>
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const isModalOpen = computed(
  () =>
    modalStore.modals[Modal.PostOnlyMode] &&
    !appStore.userState.modalsViewed.includes(Modal.PostOnlyMode)
)

function closeModal() {
  modalStore.closeModal(Modal.PostOnlyMode)

  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, Modal.PostOnlyMode]
  })
}

function onModalClose() {
  closeModal()
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm @modal:closed="onModalClose">
    <template #title>
      <h3>
        {{ $t('postOnlyMode.title') }}
      </h3>
    </template>

    <div class="relative">
      <p
        class="text-center text-sm text-coolGray-100"
        v-text="$t('postOnlyMode.description')"
      ></p>

      <div class="mt-6 flex items-center justify-center">
        <AppButton class="bg-blue-500 text-blue-900" @click="onModalClose">
          {{ $t('common.close') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
