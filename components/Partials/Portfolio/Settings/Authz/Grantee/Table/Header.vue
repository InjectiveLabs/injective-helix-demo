<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

function openGranteeModal() {
  modalStore.openModal(Modal.AddGrantee)
}

const isDisabled = computed(
  () =>
    sharedWalletStore.isAuthzWalletConnected ||
    sharedWalletStore.isAutoSignEnabled
)
</script>

<template>
  <div class="table-label p-2 flex">
    <div class="flex-1 p-2">
      {{ $t('portfolio.authZ.granteeAddress') }}
    </div>

    <div class="flex-1 p-2">
      {{ $t('portfolio.authZ.grantedFunctions') }}
    </div>

    <div class="flex-1 p-2">
      {{ $t('portfolio.authZ.actions') }}
    </div>

    <button
      :disabled="isDisabled"
      class="flex-1 p-2 font-semibold cursor-pointer select-none xs:text-left max-xs:text-center"
      :class="{
        'text-coolGray-500': isDisabled,
        'text-blue-500 hover:text-blue-600': !isDisabled
      }"
      @click="openGranteeModal"
    >
      + {{ $t('portfolio.authZ.addGranteeAddress') }}
    </button>
  </div>

  <ModalsAddAuthZAddress />
</template>
