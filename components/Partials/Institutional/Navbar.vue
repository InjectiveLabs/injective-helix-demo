<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()

function handleOpenModal() {
  modalStore.openModal({ type: Modal.InstitutionalForm })
}
</script>

<template>
  <div
    class="max-w-7xl mx-auto px-4 md:px-8 py-2 flex justify-between items-center"
  >
    <img src="/svg/helix_institutional.svg" alt="" />

    <div class="max-sm:hidden">
      <button
        class="bg-white text-black py-2 px-4 rounded-md font-semibold"
        @click="handleOpenModal"
      >
        Get in touch
      </button>
    </div>
  </div>
</template>
