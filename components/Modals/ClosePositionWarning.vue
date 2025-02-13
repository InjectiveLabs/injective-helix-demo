<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const breakpoints = useSharedBreakpoints()

const emit = defineEmits<{
  close: []
  'position:close': []
}>()

const isSmallMobile = computed(() => !breakpoints['2xs'].value)

function closeModal() {
  emit('close')
  modalStore.closeModal(Modal.ClosePositionWarning)
}

function closePosition() {
  emit('position:close')
  modalStore.closeModal(Modal.ClosePositionWarning)
}
</script>

<template>
  <SharedModal
    v-model="modalStore.modals[Modal.ClosePositionWarning]"
    @on:close="closeModal"
  >
    <div class="flex flex-col items-center pt-8">
      <img
        src="/images/warning-sign.png"
        class="w-full max-w-[150px] object-contain"
      />

      <h3 class="my-4 font-semibold text-xl">
        {{ $t('markets.closePositionWarningTitle') }}
      </h3>
      <p class="text-center text-sm font-medium leading-snug">
        {{ $t('markets.closePositionWarningDescription') }}
      </p>

      <div
        class="w-full flex gap-4 mt-12"
        :class="{ 'flex-col-reverse': isSmallMobile }"
      >
        <UButton
          variant="outline"
          :label="$t('markets.cancel')"
          class="flex-1 flex justify-center items-center py-3 px-6 max-sm:px-3 dark:text-white ring-primary-600 transition-colors"
          @click="closeModal"
        />
        <UButton
          class="flex-1 flex justify-center items-center py-3 px-6 max-sm:px-3 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
          :label="$t('markets.proceedAnyway')"
          @click="closePosition"
        />
      </div>
    </div>
  </SharedModal>
</template>
