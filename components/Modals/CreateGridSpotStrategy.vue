<script setup lang="ts">
// import { Status, StatusType } from '@injectivelabs/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Modal, SpotGridTradingForm } from '@/types'

const gridStore = useGridStore()
const modalStore = useModalStore()
// const { $onError } = useNuxtApp()
const formValues = useFormValues<SpotGridTradingForm>()
const { success } = useNotifications()

const aggreedToTerms = ref(false)

const profitPerGrid = computed(() =>
  new BigNumberInBase(formValues.value.upperPrice || 0)
    .minus(formValues.value.lowerPrice || 0)
    .dividedBy(formValues.value.grids || 1)
    .toFixed(2)
)

function closeModal() {
  modalStore.closeModal(Modal.CreateSpotGridStrategy)
}

function handleCreateStrategy() {
  gridStore
    .createStrategy({
      amount: formValues.value.investmentAmount!,
      levels: Number(formValues.value.grids!),
      lowerBound: formValues.value.lowerPrice!,
      upperBound: formValues.value.upperPrice!
    })
    .then(() => {
      success({
        title: 'Success',
        description: 'Grid Strategy Created Succesfully'
      })
    })
    .catch((_e) => {
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
          <p class="font-semibold">{{ formValues.investmentAmount }} USDT</p>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">Market</p>
          <p class="font-semibold">{{ gridStore.market?.ticker }}</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Grid Mode</p>
          <p class="font-semibold">Arithmetic</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Price Range</p>
          <p class="font-semibold">
            {{ formValues.lowerPrice }} - {{ formValues.upperPrice }} USDT
          </p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Grid Number</p>
          <p class="font-semibold">{{ formValues.grids }}</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">Profit/Grid</p>
          <p class="font-semibold">{{ profitPerGrid }} USDT</p>
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
