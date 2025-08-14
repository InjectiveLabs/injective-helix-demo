<script lang="ts" setup>
import { Modal, MainPage } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

function onConfirm() {
  closeModal()

  appStore.setUserState({
    ...appStore.userState,
    hasAcceptedTerms: true
  })

  modalStore.openModal(Modal.Connect)
}

function onCancel() {
  closeModal()
}

function closeModal() {
  modalStore.closeModal(Modal.Terms)
}
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.Terms]" v-bind="{ isXl: true }">
    <template #title>
      <h3>
        {{ $t('common.acknowledgeTerms') }}
      </h3>
    </template>

    <div class="relative">
      <i18n-t
        keypath="common.modal.terms.disclaimerNote"
        tag="p"
        class="text-sm"
      >
        <template #terms>
          <NuxtLink
            target="_blank"
            class="text-blue-500 hover:text-opacity-80"
            :to="{ name: MainPage.Terms }"
          >
            {{ $t('common.modal.terms.termsAndCondition') }}
          </NuxtLink>
        </template>

        <template #policy>
          <NuxtLink
            target="_blank"
            class="text-blue-500 hover:text-opacity-80"
            to="https://injectivelabs.org/privacy"
          >
            {{ $t('common.modal.terms.privacyPolicy') }}
          </NuxtLink>
        </template>
      </i18n-t>

      <ul class="p-4 bg-coolGray-900 mt-6 text-xs text-coolGray-300 rounded-lg">
        <li class="font-bold text-coolGray-200">
          {{ $t('common.modal.terms.title') }}
        </li>
        <li class="mt-2">
          {{ $t('common.modal.terms.acknowledge_1') }}
        </li>
        <li class="mt-2">
          {{ $t('common.modal.terms.acknowledge_2') }}
        </li>
        <li class="mt-2">
          {{ $t('common.modal.terms.acknowledge_3') }}
        </li>
        <li class="mt-2">
          {{ $t('common.modal.terms.acknowledge_4') }}
        </li>
        <li class="mt-2">
          {{ $t('common.modal.terms.acknowledge_5') }}
        </li>
      </ul>
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
