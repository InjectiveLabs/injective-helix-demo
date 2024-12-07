<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()

withDefaults(
  defineProps<{
    url?: string
  }>(),
  {
    url: ''
  }
)

const status = reactive(new Status(StatusType.Idle))

const isModalOpen = computed(() => modalStore.modals[Modal.MitoRedirect])

function closeModal() {
  modalStore.closeModal(Modal.MitoRedirect)
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm class="p-4" @modal:closed="closeModal">
    <section class="text-center">
      <div
        class="flex items-center gap-2 max-w-[300px] mt-6 mx-auto text-white"
      >
        <p class="text-sm font-medium leading-[18px]">
          {{ $t('liquidityProvision.modal.redirect') }}
        </p>
      </div>

      <img
        class="w-[110px] h-auto mx-auto mb-10 mt-8"
        src="/images/mito-logo-with-title.png"
      />
      <NuxtLink :to="url">
        <AppButton
          v-bind="{ status }"
          class="w-full text-base leading-5 font-semibold text-black"
          variant="primary"
        >
          {{ $t('liquidityProvision.modal.continueToMito') }}
        </AppButton>
      </NuxtLink>
    </section>
  </AppModal>
</template>
