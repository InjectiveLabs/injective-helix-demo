<script setup lang="ts">
// import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const gridStore = useGridStore()
const modalStore = useModalStore()
// const { $onError } = useNuxtApp()
const { success } = useNotifications()

const aggreedToTerms = ref(false)

function closeModal() {
  modalStore.closeModal(Modal.CreateSpotGridStrategy)
}

function handleCreateStrategy() {
  gridStore
    .createStrategy()
    .then(() => {
      success({
        title: 'Success',
        description: 'Grid Strategy Created Succesfully'
      })
    })
    .catch(() => {
      // console.dir(e)
    })
    .finally(() => {
      modalStore.closeModal(Modal.CreateSpotGridStrategy)
    })
}
</script>
<template>
  <AppModal
    :show="modalStore.modals[Modal.CreateSpotGridStrategy]"
    @modal:closed="closeModal"
  >
    <template #title>
      <p class="[text-transform:none] text-lg font-bold p-2">
        Grid Order Confirmation
      </p>
    </template>

    <div class="max-w-sm">
      <p>
        Please read the below information carefully before you confirm to
        proceed.
      </p>

      <div class="mt-6 space-y-1">
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Trade Amount</p>
          <p class="font-semibold">500.00 USDT</p>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">Market</p>
          <p class="font-semibold">INJ/USDT</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Grid Mode</p>
          <p class="font-semibold">Arithmetic</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Price Range</p>
          <p class="font-semibold">500.00 USDT</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Grid Number</p>
          <p class="font-semibold">500.00 USDT</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Profit/Grid</p>
          <p class="font-semibold">500.00 USDT</p>
        </div>
      </div>

      <div class="flex my-6">
        <div class="mt-1 mx-2">
          <AppCheckbox v-model="aggreedToTerms" />
        </div>
        <div>
          <p>
            I have read and agreed to the Risk Disclaimer and understand that
            the parameter selection and investment decision will in all cases be
            made solely by the client.
          </p>
        </div>
      </div>

      <div>
        <AppButton
          :disabled="!aggreedToTerms"
          class="bg-blue-500 disabled:bg-gray-500 w-full"
          @click="handleCreateStrategy"
        >
          Confirm
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
