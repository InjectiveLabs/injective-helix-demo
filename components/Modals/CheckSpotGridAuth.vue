<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const gridStore = useGridStore()
const modalStore = useModalStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

watch(
  () => modalStore.modals[Modal.CheckSpotGridAuth],
  (isOpened) => {
    if (isOpened) {
      handleCheckAuth()
    }
  }
)

function handleCheckAuth() {
  status.setLoading()

  gridStore.fetchGrants().then(() => {
    if (gridStore.isAuthorized) {
      modalStore.closeModal(Modal.CheckSpotGridAuth)
      modalStore.openModal({ type: Modal.CreateSpotGridStrategy })
    } else {
      handleAuthorization()
    }
  })
}

function handleAuthorization() {
  gridStore
    .grantAuthorization()
    .then(() => {
      gridStore.$patch({ isAuthorized: true })
      modalStore.closeModal(Modal.CheckSpotGridAuth)
      modalStore.openModal({ type: Modal.CreateSpotGridStrategy })
    })
    .catch((e) => {
      modalStore.closeModal(Modal.CheckSpotGridAuth)
      $onError(e)
    })
}

function closeModal() {
  modalStore.closeModal(Modal.CheckSpotGridAuth)
}
</script>
<template>
  <AppModal
    :show="modalStore.modals[Modal.CheckSpotGridAuth]"
    @modal:closed="closeModal"
  >
    <template #title>
      <p class="[text-transform:none] text-lg font-bold p-2">
        {{ $t('sgt.aFewClicksBeforeTheStrategyIsCreated') }}
      </p>
    </template>

    <div class="max-w-md">
      <p class="mb-6">
        {{
          $t(
            'sgt.thereAre2TransactionsRequiredToCreateAndEnableSpotGridTrading'
          )
        }}
      </p>
      <div class="flex items-start">
        <div class="p-4">
          <div
            class="w-8 h-8 rounded-full bg-blue-400 text-white grid place-items-center"
          >
            1
          </div>
        </div>
        <div>
          <p>{{ $t('sgt.letHelixSendsYouRequestForTransactions') }}</p>
          <p class="text-gray-400">{{ $t('sgt.pleaseConfirmOnYourWallet') }}</p>
        </div>
      </div>

      <div class="flex items-center">
        <div class="p-4">
          <div
            class="w-8 h-8 rounded-full bg-gray-700 text-white grid place-items-center"
          >
            2
          </div>
        </div>
        <div>
          <p>{{ $t('sgt.createYourGridTradingStrategy') }}</p>
        </div>
      </div>
    </div>
  </AppModal>
</template>
