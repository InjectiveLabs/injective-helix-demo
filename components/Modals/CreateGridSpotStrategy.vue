<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const modalStore = useModalStore()

const status = reactive(new Status(StatusType.Idle))
const isAuthorized = ref(false)

function closeModal() {
  modalStore.closeModal(Modal.CreateSpotGridStrategy)
}
</script>
<template>
  <AppModal
    :show="modalStore.modals[Modal.CreateSpotGridStrategy]"
    @modal:closed="closeModal"
  >
    <template #title>
      <p class="[text-transform:none] text-lg font-bold p-2">
        A few clicks before the strategy is created
      </p>
    </template>

    <AppHocLoading v-bind="{ status }">
      <div v-if="!isAuthorized" class="max-w-md">
        <p class="mb-6">
          There are 2 transactions required to create and enable Spot Grid
          Trading.
        </p>
        <div class="flex items-start">
          <div class="p-4">
            <div
              class="w-8 h-8 rounded-full bg-blue-400 text-white grid place-items-center"
            >
              1
            </div>
          </div>
          <div>
            <p>Let Helix sends you request for transactions</p>
            <p class="text-gray-400">Please confirm on your wallet...</p>
          </div>
        </div>

        <div class="flex items-center">
          <div class="p-4">
            <div
              class="w-8 h-8 rounded-full bg-gray-700 text-white grid place-items-center"
            >
              2
            </div>
          </div>
          <div>
            <p>Create your grid trading strategy</p>
          </div>
        </div>
      </div>

      <div v-else>
        <p>Authorized</p>
      </div>
    </AppHocLoading>
  </AppModal>
</template>
