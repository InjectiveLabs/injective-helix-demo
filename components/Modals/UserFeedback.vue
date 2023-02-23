<script lang="ts" setup>
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()

const url = 'https://helixapp.xyz/3IGFwb9'

const isModalOpen = computed(() => modalStore.modals[Modal.UserFeedback])

onMounted(() => {
  if (!appStore.userState.userFeedbackModalViewed) {
    setTimeout(() => {
      modalStore.openModal({ type: Modal.UserFeedback })
    }, 5000)
  }
})

function handleClose() {
  modalStore.closeModal(Modal.UserFeedback)
}

function updateUserFeedbackModalViewed() {
  appStore.setUserState({
    ...appStore.userState,
    userFeedbackModalViewed: true
  })

  handleClose()
}
</script>

<template>
  <AppModal :show="isModalOpen" sm @modal:closed="handleClose">
    <div class="flex flex-col -mt-5 justify-center items-center">
      <div class="flex items-center justify-center cursor-pointer mb-6">
        <AssetLogo class="h-7 w-10 mr-2" alt="Helix" />
        <AssetLogoText class="h-7" />
      </div>

      <span class="text-xl font-semibold mb-1">
        {{ $t('banners.userFeedback.loveFeedback') }}
      </span>

      <span class="text-sm leading-5 text-center mb-6">
        <span>
          {{ $t('banners.userFeedback.thankYouBeginning') }}
        </span>
        <span class="font-semibold">
          {{ $t('banners.userFeedback.threeMinutes') }}
        </span>
        <span>
          {{ $t('banners.userFeedback.thankYouEnd') }}
        </span>
      </span>

      <NuxtLink
        class="whitespace-nowrap w-full bg-blue-500 text-blue-900 rounded mb-4"
        :to="url"
        target="_blank"
        @click="updateUserFeedbackModalViewed"
      >
        <div
          class="flex items-center justify-center py-2 text-blue-900 font-semibold text-sm"
        >
          {{ $t('banners.userFeedback.takeSurvey') }}
        </div>
      </NuxtLink>

      <AppButton
        class="bg-transparent w-full hover:bg-gray-700 font-semibold text-sm"
        @click="updateUserFeedbackModalViewed"
      >
        {{ $t('banners.userFeedback.notRightNow') }}
      </AppButton>
    </div>
  </AppModal>
</template>
