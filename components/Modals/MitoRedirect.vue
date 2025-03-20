<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useSharedModalStore()

withDefaults(
  defineProps<{
    url?: string
  }>(),
  { url: '' }
)
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.MitoRedirect]">
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
          class="w-full text-base leading-5 font-semibold text-black"
          variant="primary"
        >
          {{ $t('liquidityProvision.modal.continueToMito') }}
        </AppButton>
      </NuxtLink>
    </section>
  </AppModal>
</template>
