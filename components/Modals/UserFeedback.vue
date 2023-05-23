<script lang="ts" setup>
import { AmplitudeEvent, Modal, SurveyTitle } from '@/types'
import { amplitudeGenericTracker } from '@/app/providers/amplitude'

const route = useRoute()
const appStore = useAppStore()
const modalStore = useModalStore()

const url = 'https://helixapp.xyz/3IGFwb9'

const isModalOpen = computed(() => modalStore.modals[Modal.UserFeedback])

onMounted(() => {
  init()
})

function init() {
  if (appStore.userState.userFeedbackModalViewed) {
    return
  }

  const DELAY_MODAL_DISPLAY_TIME = 30 * 1000

  setTimeout(() => {
    const disabledRoutes = [
      'spot-spot',
      'market-market',
      'futures-futures',
      'perpetual-perpetual',
      'derivative-derivative',
      'binary-options-binaryOption'
    ]

    if (!disabledRoutes.includes(route.name as string)) {
      modalStore.openModal({ type: Modal.UserFeedback })
    }
  }, DELAY_MODAL_DISPLAY_TIME)
}

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

function handleTakeSurveyClickEvent() {
  amplitudeGenericTracker.trackEvent(AmplitudeEvent.SurveyAccepted, {
    surveyTitle: SurveyTitle.HelixUserSurveyFeb23
  })

  updateUserFeedbackModalViewed()
}

function handleRejectSurveyClickEvent() {
  amplitudeGenericTracker.trackEvent(AmplitudeEvent.SurveyRejected, {
    surveyTitle: SurveyTitle.HelixUserSurveyFeb23
  })

  updateUserFeedbackModalViewed()
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
        @click="handleTakeSurveyClickEvent"
      >
        <div
          class="flex items-center justify-center py-2 text-blue-900 font-semibold text-sm"
        >
          {{ $t('banners.userFeedback.takeSurvey') }}
        </div>
      </NuxtLink>

      <AppButton
        class="bg-transparent w-full hover:bg-gray-700 font-semibold text-sm"
        @click="handleRejectSurveyClickEvent"
      >
        {{ $t('banners.userFeedback.notRightNow') }}
      </AppButton>
    </div>
  </AppModal>
</template>
