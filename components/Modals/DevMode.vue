<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()
const sharedWalletStore = useSharedWalletStore()
const { t } = useLang()
const { resetForm } = useForm()
const { $onError } = useNuxtApp()
const { success } = useSharedNotificationStore()

const status = reactive(new Status(StatusType.Idle))

const { value: injectiveAddress, errors } = useStringField({
  name: 'injAddress',
  rule: 'required|injAddress'
})

const isModalOpen = computed(() => modalStore.modals[Modal.DevMode])

function closeModal() {
  resetForm()
  modalStore.closeModal(Modal.DevMode)
}

function onModalClose() {
  closeModal()
}

function connect() {
  status.setLoading()

  sharedWalletStore
    .connectAddress(injectiveAddress.value)
    .then(() => success({ title: t('connect.successfullyConnected') }))
    .catch((e) => {
      walletStore.disconnect()
      WalletTracker.trackLogout()

      $onError(e)
    })
    .finally(() => {
      status.setIdle()

      closeModal()
    })
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm @modal:closed="onModalClose">
    <template #title>
      <h3 class="text-base">
        {{ $t('devMode.connectWithAddress') }}
      </h3>
    </template>

    <div>
      <div class="mt-6 flex flex-wrap items-center justify-center">
        <div class="w-full">
          <AppInput
            v-model="injectiveAddress"
            wrapper-classes="py-2 px-1"
            :placeholder="$t('devMode.enterInjectiveAddress')"
          />
        </div>
        <div class="w-full mt-4 text-center">
          <AppButton
            is-lg
            class="text-blue-900 bg-blue-500"
            :is-disabled="errors.length > 0"
            :is-loading="status.isLoading()"
            @click="connect"
          >
            {{ $t('devMode.connect') }}
          </AppButton>
        </div>
      </div>
      <div
        v-if="errors.length > 0"
        class="mt-2 text-left text-sm capitalize-phrase"
      >
        <span class="text-red-500">{{ errors[0] }}</span>
      </div>
    </div>
  </AppModal>
</template>
