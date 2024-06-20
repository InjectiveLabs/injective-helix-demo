<script setup lang="ts">
import { Modal } from '@/types'

const walletStore = useSharedWalletStore()
const modalStore = useModalStore()

function openGranteeModal() {
  modalStore.openModal(Modal.AddGrantee)
}

const isDisabled = computed(
  () => walletStore.isAuthzWalletConnected || walletStore.isAutoSignEnabled
)
</script>

<template>
  <div class="table-label p-2 flex">
    <div class="flex-1 p-2">
      {{ $t('portfolio.settings.authz.granteeAddress') }}
    </div>

    <div class="flex-1 p-2">
      {{ $t('portfolio.settings.authz.grantedFunctions') }}
    </div>

    <div class="flex-1 p-2">
      {{ $t('portfolio.settings.authz.actions') }}
    </div>

    <button
      :disabled="isDisabled"
      class="flex-1 p-2 font-semibold cursor-pointer select-none text-left"
      :class="{
        'text-gray-500': isDisabled,
        'text-blue-500 hover:text-blue-600': !isDisabled
      }"
      @click="openGranteeModal"
    >
      + {{ $t('portfolio.settings.authz.addGranteeAddress') }}
    </button>
  </div>

  <ModalsAddAuthZAddress />
</template>
