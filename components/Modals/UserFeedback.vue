<script lang="ts" setup>
import { Modal, SurveyTitle, TradeSubPage } from '@/types'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
const route = useRoute()
const appStore = useAppStore()
const modalStore = useModalStore()

const url = 'https://helixapp.xyz/3IGFwb9'

const isModalOpen = computed(() => modalStore.modals[Modal.UserFeedback])

onMounted(() => {
  init()
})

function init() {
  if (appStore.userState.modalsViewed.includes(Modal.UserFeedback)) {
    return
  }

  const DELAY_MODAL_DISPLAY_TIME = 30 * 1000

  setTimeout(() => {
    const disabledRoutes = [
      TradeSubPage.Spot,
      TradeSubPage.Market,
      TradeSubPage.Futures,
      TradeSubPage.Perpetual,
      TradeSubPage.Derivatives,
      TradeSubPage.BinaryOption
    ]

    if (!disabledRoutes.includes(route.name as TradeSubPage)) {
      modalStore.openModal(Modal.UserFeedback)
    }
  }, DELAY_MODAL_DISPLAY_TIME)
}

function onClose() {
  modalStore.closeModal(Modal.UserFeedback)
}

function userFeedbackModalViewed() {
  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, Modal.UserFeedback]
  })

  onClose()
}

function onTakeSurveyClickEvent() {
  mixpanelAnalytics.trackSurveyAccepted(SurveyTitle.HelixUserSurveyFeb23)

  userFeedbackModalViewed()
}

function onRejectSurveyClickEvent() {
  mixpanelAnalytics.trackSurveyRejected(SurveyTitle.HelixUserSurveyFeb23)

  userFeedbackModalViewed()
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm @modal:closed="onClose">
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
        @click="onTakeSurveyClickEvent"
      >
        <div
          class="flex items-center justify-center py-2 text-blue-900 font-semibold text-sm"
        >
          {{ $t('banners.userFeedback.takeSurvey') }}
        </div>
      </NuxtLink>

      <AppButton
        class="bg-transparent w-full hover:bg-gray-700 font-semibold text-sm"
        @click="onRejectSurveyClickEvent"
      >
        {{ $t('banners.userFeedback.notRightNow') }}
      </AppButton>
    </div>
  </AppModal>
</template>
