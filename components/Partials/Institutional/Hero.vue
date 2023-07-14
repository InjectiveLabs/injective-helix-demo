<script setup lang="ts">
import { Modal } from '@/types'
const modalStore = useModalStore()

function handleOpenModal() {
  modalStore.openModal({ type: Modal.InstitutionalForm })
}
</script>

<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-2 mt-10 sm:mt-20 lg:mt-32 gap-20 mb-32"
  >
    <div class="flex flex-col items-start justify-center space-y-8">
      <div class="font-bold text-5xl">
        <h2>Institutional DeFi. Transparent. Efficient.</h2>
      </div>
      <p class="text-xl">
        Trade unlimited cross-chain crypto assets and perpetual markets with
        market leading rebates
      </p>
      <div>
        <button
          class="bg-white text-black py-2 px-4 rounded-md font-semibold"
          @click="handleOpenModal"
        >
          Get in touch
        </button>
      </div>
    </div>

    <div>
      <img src="/svg/helix_institutional_hero.svg" class="mx-auto" alt="" />
    </div>
  </div>
</template>
