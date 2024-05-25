<script lang="ts" setup>
import { Modal, MainPage } from '@/types'

const modalStore = useModalStore()

const emit = defineEmits<{
  'terms:agreed': []
}>()

function closeModal() {
  modalStore.closeModal(Modal.ClosedRWAMarket)
}

function onModalClose() {
  closeModal()

  return navigateTo({ name: MainPage.Index })
}

function confirm() {
  emit('terms:agreed')
  closeModal()
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.ClosedRWAMarket]"
    is-sm
    @modal:closed="onModalClose"
  >
    <template #title>
      <div class="text-orange-300 flex space-x-1 items-center justif-center">
        <SharedIcon name="warning-triangle" is-md />
        <h3 class="normal-case text-lg">
          {{ $t('trade.rwa.warning') }}
        </h3>
      </div>
    </template>

    <div class="relative">
      <div class="flex flex-col gap-4">
        <p>
          {{ $t('trade.rwa.marketIsClosed') }}
        </p>

        <i18n-t keypath="trade.rwa.marketClosedTrade" tag="p">
          <template #marketClosedTimes>
            <NuxtLink
              class="opacity-75 cursor-pointer text-blue-500 hover:opacity-50"
              to="https://docs.pyth.network/price-feeds/market-hours"
              target="_blank"
            >
              {{ $t('trade.rwa.marketClosedTimes') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </div>

      <div class="mt-6 flex items-center justify-center gap-2">
        <AppButton class="bg-blue-500 text-blue-900 w-full" @click="confirm">
          {{ $t('trade.rwa.acknowledge') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
