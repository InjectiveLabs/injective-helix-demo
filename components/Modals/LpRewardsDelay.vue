<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.LpRewardsDelay])

function closeModal() {
  modalStore.closeModal(Modal.LpRewardsDelay)
}
</script>

<template>
  <Teleport to="body">
    <AppModal :is-open="isModalOpen" @modal:closed="closeModal">
      <div
        class="max-sm:pt-10 max-w-sm md:text-xl space-y-2 text-center text-gray-300"
      >
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-full aspect-square max-w-[100px] mx-auto mb-6 text-white"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </div>

        <div>
          <p>
            Get ready for <span class="font-bold">Round 3</span> of LP rewards,
            starting later today and lasting for one week.
          </p>

          <p class="py-2">
            Happy <span class="font-bold text-white">LP</span>'ing!
          </p>
        </div>

        <div class="pt-2">
          <AppButton
            class="bg-blue-500 text-blue-900 font-semibold w-full"
            @click="closeModal"
          >
            Close
          </AppButton>
        </div>
      </div>
    </AppModal>
  </Teleport>
</template>
