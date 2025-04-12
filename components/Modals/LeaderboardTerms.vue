<script lang="ts" setup>
import { Modal, LeaderboardSubPage } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const isModalOpen = computed(
  () =>
    modalStore.modals[Modal.LeaderboardTerms] &&
    !appStore.userState.modalsViewed.includes(Modal.LeaderboardTerms)
)

function onCancel() {
  modalStore.closeModal(Modal.LeaderboardTerms)

  return navigateTo({ name: LeaderboardSubPage.Pnl })
}

function onConfirm() {
  modalStore.closeModal(Modal.LeaderboardTerms)

  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, Modal.LeaderboardTerms]
  })

  return navigateTo({ name: LeaderboardSubPage.Competition })
}
</script>

<template>
  <AppModal
    v-bind="{ isXl: true, modelValue: isModalOpen }"
    @on:close="onCancel"
  >
    <div class="relative">
      <PartialsLeaderboardTermsOwnYourAsset
        class="max-h-[350px] overflow-scroll"
      />

      <div class="mt-6 flex items-center justify-center gap-3">
        <AppButton
          class="bg-blue-500 text-blue-900 font-semibold"
          @click="onConfirm"
        >
          {{ $t('common.confirm') }}
        </AppButton>
        <AppButton variant="danger-outline" @click="onCancel">
          {{ $t('common.cancel') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
