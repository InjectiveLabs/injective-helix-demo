<script lang="ts" setup>
import { Modal, MainPage, SpotMarketCyTags } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const isDoNoShowConfirmationAgain = ref(false)

onMounted(() => {
  if (appStore.userState.preferences.skipExperimentalConfirmationModal) {
    return
  }

  modalStore.openModal(Modal.MarketNotOnHelix)
})

function onCloseModal() {
  modalStore.closeModal(Modal.MarketNotOnHelix)
}

function onSubmit() {
  onCloseModal()

  if (isDoNoShowConfirmationAgain.value) {
    appStore.setUserState({
      ...appStore.userState,
      preferences: {
        ...appStore.userState.preferences,
        skipExperimentalConfirmationModal: true
      }
    })
  }
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.MarketNotOnHelix]"
    v-bind="{ isHideCloseButton: true }"
  >
    <template #title>
      <h3 :data-cy="dataCyTag(SpotMarketCyTags.ExperimentalMarketLabel)">
        {{ $t('trade.marketNotOnHelix.title') }}
      </h3>
    </template>

    <div class="relative space-y-4">
      <p class="text-center text-sm text-coolGray-100">
        {{ $t('trade.marketNotOnHelix.description') }}
      </p>

      <i18n-t
        keypath="trade.marketNotOnHelix.description2"
        class="text-sm text-center text-coolGray-100"
        tag="p"
      >
        <template #link>
          <NuxtLink :to="{ name: MainPage.Terms }" class="text-blue-500">
            <span>{{ $t('trade.marketNotOnHelix.termsAndCondition') }}</span>
          </NuxtLink>
        </template>
      </i18n-t>

      <div class="mt-6 flex items-center justify-center">
        <AppButton
          class="bg-blue-500 text-blue-900"
          :data-cy="dataCyTag(SpotMarketCyTags.IUnderstandButton)"
          @click="onSubmit"
        >
          {{ $t('trade.marketNotOnHelix.cta') }}
        </AppButton>
      </div>

      <div
        class="flex"
        :data-cy="dataCyTag(SpotMarketCyTags.DoNotShowAgainCheckbox)"
      >
        <AppCheckbox v-model="isDoNoShowConfirmationAgain" class="mx-auto">
          <slot class="text-xs">
            {{ $t('trade.doNotShowThisConfirmationAgain') }}
          </slot>
        </AppCheckbox>
      </div>
    </div>
  </AppModal>
</template>
