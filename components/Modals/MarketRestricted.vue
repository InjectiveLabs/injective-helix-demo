<script lang="ts" setup>
import { Modal, MainPage } from '@/types'

const modalStore = useModalStore()

const props = defineProps({
  isSpot: Boolean,

  modal: {
    type: String as PropType<Modal>,
    default: Modal.FuturesMarketRestricted
  },

  symbol: {
    type: String,
    default: ''
  }
})

const isModalOpen = computed(() => modalStore.modals[props.modal])

function closeModal() {
  modalStore.closeModal(props.modal)
}
</script>

<template>
  <AppModal :is-open="isModalOpen" sm hide-close-button is-always-open>
    <template #title>
      <h3 class="text-center">
        {{ $t('MarketRestricted.title') }}
      </h3>
    </template>

    <div class="relative">
      <p class="text-center text-sm text-gray-100">
        {{
          $t(`MarketRestricted.description.${isSpot ? 'spot' : 'perpetual'}`, {
            symbol
          })
        }}
      </p>

      <div class="mt-6 flex items-center justify-center">
        <NuxtLink :to="{ name: MainPage.Index }">
          <AppButton class="bg-blue-500 text-blue-900" @click="closeModal">
            {{ $t('MarketRestricted.cta') }}
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>
