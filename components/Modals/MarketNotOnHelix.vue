<script lang="ts" setup>
import { Modal, MainPage } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.MarketNotOnHelix])

onMounted(() => {
  modalStore.openModal(Modal.MarketNotOnHelix)
})

function onCloseModal() {
  modalStore.closeModal(Modal.MarketNotOnHelix)
}

function handleSkipConfirmationModal() {
  appStore.setUserState({
    ...appStore.userState,
    skipExperimentalCOnfirmationModal: true
  })
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm is-hide-close-button>
    <template #title>
      <h3>
        {{ $t('marketNotOnHelix.title') }}
      </h3>
    </template>

    <div class="relative space-y-4">
      <p class="text-center text-sm text-gray-100">
        {{ $t('marketNotOnHelix.description') }}
      </p>

      <i18n-t
        keypath="marketNotOnHelix.description2"
        class="text-sm text-center text-gray-100"
        tag="p"
      >
        <template #link>
          <NuxtLink :to="{ name: MainPage.Terms }" class="text-blue-500">
            <span>{{ $t('marketNotOnHelix.termsAndCondition') }}</span>
          </NuxtLink>
        </template>
      </i18n-t>

      <div class="mt-6 flex items-center justify-center">
        <AppButton class="bg-blue-500 text-blue-900" @click="onCloseModal">
          {{ $t('marketNotOnHelix.cta') }}
        </AppButton>
      </div>

      <div class="flex">
        <AppCheckbox
          :model-value="false"
          class="mx-auto"
          @input="handleSkipConfirmationModal"
        >
          <slot class="text-xs">
            {{ $t('trade.confirmOrderModal.doNotShowThisConfirmationAgain') }}
          </slot>
        </AppCheckbox>
      </div>
    </div>
  </AppModal>
</template>
