<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()

function openGranteeModal() {
  modalStore.openModal(Modal.AddGrantee)
}
</script>

<template>
  <div class="table-label p-2 flex">
    <div class="flex-1 p-2">Grantee Address</div>

    <div class="flex-1 p-2">Granted Functions</div>

    <div class="flex-1 p-2">Actions</div>

    <button
      class="flex-1 p-2 text-blue-500 hover:text-blue-600 font-semibold cursor-pointer select-none text-left"
      @click="openGranteeModal"
    >
      + Add Grantee Address
    </button>
  </div>

  <ModalsAddAuthZAddress />
</template>
