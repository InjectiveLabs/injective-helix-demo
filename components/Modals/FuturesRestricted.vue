<script lang="ts" setup>
import { Modal, MainPage } from '@/types'

const modalStore = useModalStore()

const isModalOpen = computed(
  () => modalStore.modals[Modal.FuturesMarketRestricted]
)

function closeModal() {
  modalStore.closeModal(Modal.FuturesMarketRestricted)
}
</script>

<template>
  <AppModal :is-open="isModalOpen" sm hide-close-button is-always-open>
    <template #title>
      <h3 class="text-center">
        {{ $t('futuresMarketRestricted.title') }}
      </h3>
    </template>

    <div class="relative">
      <p
        class="text-center text-sm text-gray-100"
        v-text="$t('futuresMarketRestricted.description')"
      ></p>

      <div class="mt-6 flex items-center justify-center">
        <NuxtLink :to="{ name: MainPage.Index }">
          <AppButton class="bg-blue-500 text-blue-900" @click="closeModal">
            {{ $t('futuresMarketRestricted.cta') }}
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>
